import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import WebView, { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import KeyboardAwareWebView from '../components/KeyboardAwareWebView';
import LiquidTabBar, { TabKey } from '../components/LiquidTabBar';
import * as ScreenCapture from 'expo-screen-capture';
import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts';
import { WEB_URL } from '../config/env';
import { SCREEN_PATHS, buildUrl } from '../lib/webBridge';
import type { RootStackParamList } from '../navigation/AppNavigator';

/** 실제로 WebView를 미리 마운트해서 캐싱할 탭들 */
const CACHED_TABS: { key: TabKey; path: string }[] = [
  { key: 'recommend', path: '/' },
  { key: 'my', path: '/my' },
];

function pathToTab(url: string): TabKey | null {
  const path = url.replace(WEB_URL, '').split('?')[0] || '/';
  if (path === '/') return 'recommend';
  if (path.startsWith('/my')) return 'my';
  return null;
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 탭별 WebView ref
  const webViewRefs = useRef<Partial<Record<TabKey, WebView | null>>>({});

  const [activeTab, setActiveTab] = useState<TabKey>('recommend');
  const [loadingTabs, setLoadingTabs] = useState<Set<TabKey>>(
    new Set(['recommend', 'my']),
  );
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | undefined>();

  // TODO: 오픈 전에 아래 캡쳐 방지 코드 주석 해제
  // ScreenCapture.usePreventScreenCapture();
  // React.useEffect(() => {
  //   const sub = ScreenCapture.addScreenshotListener(() => {
  //     Alert.alert('캡쳐 불가', '이 화면은 개인정보 보호를 위해 캡쳐가 제한됩니다.', [{ text: '확인' }]);
  //   });
  //   return () => sub.remove();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const ref = webViewRefs.current[activeTab];
        if (ref) {
          ref.goBack();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [activeTab]),
  );

  async function fetchProfilePhoto(token: string) {
    try {
      const res = await fetch(`${WEB_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const user = await res.json();
      if (user.photos) {
        const photos: string[] = JSON.parse(user.photos);
        if (photos[0]) setProfilePhotoUrl(photos[0]);
      }
    } catch {
      /* 실패 시 기본 아이콘 사용 */
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

  /** 특정 탭의 WebView가 보내는 메시지 핸들러 팩토리 */
  function makeMessageHandler(tabKey: TabKey) {
    return (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        const ref = webViewRefs.current[tabKey] ?? null;

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
        if (data.type === 'authToken' && data.token) {
          fetchProfilePhoto(data.token);
          return;
        }
        if (data.type !== 'navigate') return;

        // 로그아웃 / 탈퇴
        if (data.screen === 'Landing' || data.screen === 'PhoneInput') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'OnboardingWebView', params: { url: buildUrl('/onboarding') } }],
          });
          return;
        }

        // 탭 전환 (캐싱된 탭이면 URI 변경 없이 탭만 전환)
        if (data.screen === 'Home') {
          setActiveTab('recommend');
          return;
        }

        // 나머지는 별도 스택으로 push
        const path = SCREEN_PATHS[data.screen];
        if (path) {
          navigation.push('OnboardingWebView', { url: buildUrl(path, data.params) });
        }
      } catch {
        /* ignore */
      }
    };
  }

  function makeLoadEndHandler(tabKey: TabKey) {
    return () => {
      setLoadingTabs(prev => {
        const next = new Set(prev);
        next.delete(tabKey);
        return next;
      });
      // auth_token을 가져와서 프로필 사진을 fetching
      webViewRefs.current[tabKey]?.injectJavaScript(`
        (function() {
          var token = localStorage.getItem('auth_token');
          if (token) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'authToken', token: token }));
          }
        })();
        true;
      `);
    };
  }

  function makeNavStateHandler(tabKey: TabKey) {
    return (navState: WebViewNavigation) => {
      if (tabKey === activeTab) {
        // 현재 활성 탭의 URL이 바뀌면 active tab을 추적
        const tab = pathToTab(navState.url);
        if (tab && tab !== activeTab) setActiveTab(tab);
      }
    };
  }

  function handleTabPress(tab: TabKey) {
    const isCached = CACHED_TABS.some(t => t.key === tab);
    if (!isCached) {
      Alert.alert('준비 중이에요', '곧 만나볼 수 있어요.');
      return;
    }
    setActiveTab(tab);
  }

  const isAnyLoading = loadingTabs.size > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 캐싱 탭: 미리 마운트하고, 비활성 탭은 opacity:0 + pointerEvents:'none'으로 숨김 */}
      {CACHED_TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <View
            key={tab.key}
            pointerEvents={isActive ? 'auto' : 'none'}
            style={[StyleSheet.absoluteFill, !isActive && styles.hiddenTab]}
          >
            <KeyboardAwareWebView
              ref={r => { webViewRefs.current[tab.key] = r; }}
              source={{ uri: buildUrl(tab.path) }}
              style={styles.webview}
              onLoadStart={() =>
                setLoadingTabs(prev => new Set([...prev, tab.key]))
              }
              onLoadEnd={makeLoadEndHandler(tab.key)}
              onMessage={makeMessageHandler(tab.key)}
              onNavigationStateChange={makeNavStateHandler(tab.key)}
              javaScriptEnabled
              domStorageEnabled
              allowsBackForwardNavigationGestures={isActive}
              startInLoadingState={false}
            />
          </View>
        );
      })}

      {/* 로딩 오버레이: 초기 로딩 중일 때만 */}
      {isAnyLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#aecbff" />
        </View>
      )}

      <LiquidTabBar
        active={activeTab}
        onPress={handleTabPress}
        profilePhotoUrl={profilePhotoUrl}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  webview: { flex: 1 },
  // opacity:0으로 렌더링은 유지하되 화면에 보이지 않게 숨김
  hiddenTab: { opacity: 0 },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
