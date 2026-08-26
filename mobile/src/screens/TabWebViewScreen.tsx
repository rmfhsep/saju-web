import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import WebView, { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import KeyboardAwareWebView from '../components/KeyboardAwareWebView';
import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts';
import { WEB_URL } from '../config/env';
import { SCREEN_PATHS, buildUrl } from '../lib/webBridge';
import { registerForPushNotifications } from '../lib/push';
import { setStoredAuthToken, clearStoredAuthToken } from '../lib/authStorage';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useHomeTabsContext } from '../navigation/HomeTabsContext';

export type TabKey = 'recommend' | 'like' | 'message' | 'my';

export function pathToTab(url: string): TabKey | null {
  const path = url.replace(WEB_URL, '').split('?')[0] || '/';
  if (path === '/') return 'recommend';
  if (path.startsWith('/likes')) return 'like';
  if (path.startsWith('/messages')) return 'message';
  if (path.startsWith('/my')) return 'my';
  return null;
}

/**
 * 탭 루트 하나(추천/호감/메시지/내 정보)에 해당하는 화면. 각자 독립된 native tab 스크린이라
 * 탭 전환은 OS 탭바가 담당하고, 여기서는 자기 웹뷰의 로딩/메시지/뒤로가기만 다룬다.
 * lazy:false 기본값 덕에 4개 스크린 모두 처음부터 마운트돼 있어 이전과 같은 캐싱 효과를 낸다.
 */
export default function TabWebViewScreen({ tabKey, path }: { tabKey: TabKey; path: string }) {
  const navigation = useNavigation();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const { webViewRefs, setProfilePhotoUrl, pushRegisteredRef } = useHomeTabsContext();
  const webViewRef = useRef<WebView | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, []),
  );

  async function fetchProfilePhoto(token: string) {
    try {
      const res = await fetch(`${WEB_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn('[TabWebViewScreen] /api/auth/me failed:', res.status);
        return;
      }
      const user = await res.json();
      if (!user.photos) {
        console.warn('[TabWebViewScreen] user has no photos field:', tabKey);
        return;
      }
      const photos: string[] = JSON.parse(user.photos);
      if (photos[0]) {
        console.log('[TabWebViewScreen] setProfilePhotoUrl:', photos[0]);
        setProfilePhotoUrl(photos[0]);
      } else {
        console.warn('[TabWebViewScreen] photos array is empty');
      }
    } catch (err) {
      console.warn('[TabWebViewScreen] fetchProfilePhoto threw:', err);
    }
  }

  async function handleRequestContacts(ref: WebView | null) {
    try {
      const { status } = await requestPermissionsAsync();
      if (status !== 'granted') {
        ref?.injectJavaScript(
          `window.__onContactsPermissionDenied && window.__onContactsPermissionDenied(); true;`,
        );
        return;
      }
      const contacts = await Contact.getAllDetails([ContactField.PHONES]);
      const phones: string[] = [];
      for (const contact of contacts) {
        for (const p of contact.phones ?? []) {
          const digits = (p.number ?? '').replace(/\D/g, '');
          if (digits.length >= 9) phones.push(digits);
        }
      }
      ref?.injectJavaScript(
        `window.__onContactsReceived && window.__onContactsReceived(${JSON.stringify(phones)}); true;`,
      );
    } catch {
      ref?.injectJavaScript(
        `window.__onContactsReceived && window.__onContactsReceived([]); true;`,
      );
    }
  }

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      const ref = webViewRef.current;

      if (data.type === 'back') {
        ref?.goBack();
        return;
      }
      if (data.type === 'openSms') {
        const smsUrl =
          Platform.OS === 'ios'
            ? `sms:${data.phone}&body=${encodeURIComponent(data.body)}`
            : `sms:${data.phone}?body=${encodeURIComponent(data.body)}`;
        Linking.openURL(smsUrl);
        return;
      }
      if (data.type === 'requestContacts') {
        handleRequestContacts(ref);
        return;
      }
      if (data.type === 'openAppSettings') {
        Linking.openSettings();
        return;
      }
      if (data.type === 'push' && typeof data.path === 'string') {
        rootNavigation?.push('OnboardingWebView', { url: buildUrl(data.path) });
        return;
      }
      if (data.type === 'replace' && typeof data.path === 'string') {
        rootNavigation?.replace('OnboardingWebView', { url: buildUrl(data.path) });
        return;
      }
      if (data.type === 'authToken' && data.token) {
        fetchProfilePhoto(data.token);
        setStoredAuthToken(data.token);
        // 로그인 상태가 확인된 시점에 한 번만 푸시 알림 권한을 요청하고 토큰을 등록
        if (!pushRegisteredRef.current) {
          pushRegisteredRef.current = true;
          registerForPushNotifications(webViewRefs.current.recommend ?? null);
        }
        return;
      }
      if (data.type !== 'navigate') return;

      // 로그아웃 / 탈퇴
      if (data.screen === 'Landing' || data.screen === 'PhoneInput') {
        clearStoredAuthToken();
        const p = data.screen === 'PhoneInput' ? '/onboarding/phone' : '/onboarding';
        rootNavigation?.reset({
          index: 0,
          routes: [{ name: 'OnboardingWebView', params: { url: buildUrl(p) } }],
        });
        return;
      }

      // 탭 전환 — 네이티브 탭 자체를 전환한다
      if (data.screen === 'Home') {
        navigation.navigate('recommend' as never);
        return;
      }

      // 나머지는 별도 스택으로 push
      const p = SCREEN_PATHS[data.screen];
      if (p) {
        rootNavigation?.push('OnboardingWebView', { url: buildUrl(p, data.params) });
      }
    } catch {
      /* ignore */
    }
  }

  function handleLoadEnd() {
    setLoading(false);
    webViewRef.current?.injectJavaScript(`
      (function() {
        var token = localStorage.getItem('auth_token');
        if (token) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'authToken', token: token }));
        }
      })();
      true;
    `);
  }

  // 정상 흐름에선 탭 전환이 항상 브릿지(navigate 메시지)를 통해서만 일어나지만,
  // 혹시 이 웹뷰가 자기 탭 경로 밖으로 클라이언트 네비게이션해버린 경우를 대비한 안전망.
  function handleNavStateChange(navState: WebViewNavigation) {
    const tab = pathToTab(navState.url);
    if (tab && tab !== tabKey) {
      navigation.navigate(tab as never);
    }
  }

  function handleShouldStartLoadWithRequest(request: { url: string }): boolean {
    const { url } = request;
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('about:') ||
      url.startsWith('data:')
    ) {
      return true;
    }
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) Linking.openURL(url);
      })
      .catch(() => {});
    return false;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAwareWebView
        ref={r => {
          webViewRef.current = r;
          webViewRefs.current[tabKey] = r;
        }}
        source={{ uri: buildUrl(path) }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={handleLoadEnd}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures={isFocused}
        startInLoadingState={false}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#aecbff" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
