import React, { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import KeyboardAwareWebView from '../components/KeyboardAwareWebView';
import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { SCREEN_PATHS, buildUrl } from '../lib/webBridge';
import { setStoredAuthToken } from '../lib/authStorage';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingWebView'>;
  route: RouteProp<RootStackParamList, 'OnboardingWebView'>;
};

export default // 원래는 온보딩 전용이었지만, 지금은 4개 탭 루트(HomeScreen) 아래의 모든 서브페이지가
// 이 화면을 통해 네이티브 스택에 push된다 — 'push'/'replace' 메시지가 그 경로다.
function OnboardingWebViewScreen({ navigation, route }: Props) {
  const { url } = route.params;
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation])
  );

  async function handleRequestContacts() {
    try {
      const { status } = await requestPermissionsAsync();
      if (status !== 'granted') {
        webViewRef.current?.injectJavaScript(
          `window.__onContactsPermissionDenied && window.__onContactsPermissionDenied(); true;`
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
      webViewRef.current?.injectJavaScript(
        `window.__onContactsReceived && window.__onContactsReceived(${JSON.stringify(phones)}); true;`
      );
    } catch {
      webViewRef.current?.injectJavaScript(
        `window.__onContactsReceived && window.__onContactsReceived([]); true;`
      );
    }
  }

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'back') {
        if (navigation.canGoBack()) navigation.goBack();
        return;
      }

      if (data.type === 'push' && typeof data.path === 'string') {
        navigation.push('OnboardingWebView', { url: buildUrl(data.path) });
        return;
      }

      if (data.type === 'replace' && typeof data.path === 'string') {
        navigation.replace('OnboardingWebView', { url: buildUrl(data.path) });
        return;
      }

      if (data.type === 'openAppSettings') {
        Linking.openSettings();
        return;
      }

      if (data.type === 'openSms') {
        const smsUrl = Platform.OS === 'ios'
          ? `sms:${data.phone}&body=${encodeURIComponent(data.body)}`
          : `sms:${data.phone}?body=${encodeURIComponent(data.body)}`;
        Linking.openURL(smsUrl);
        return;
      }

      if (data.type === 'requestContacts') {
        handleRequestContacts();
        return;
      }

      if (data.type === 'authToken' && data.token) {
        setStoredAuthToken(data.token);
        return;
      }

      if (data.type !== 'navigate') return;

      if (data.screen === 'Home') {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        return;
      }

      const path = SCREEN_PATHS[data.screen];
      if (path) {
        navigation.push('OnboardingWebView', { url: buildUrl(path, data.params) });
      }
    } catch {
      // ignore malformed messages
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareWebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          setLoading(false);
          // 페이지가 새로 로드될 때마다 로그인 토큰을 네이티브에 미러링해둔다
          // (다음 콜드 스타트 때 온보딩을 건너뛰고 Home으로 바로 갈 수 있도록).
          webViewRef.current?.injectJavaScript(`
            (function() {
              var token = localStorage.getItem('auth_token');
              if (token) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'authToken', token: token }));
              }
            })();
            true;
          `);
        }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures={false}
        automaticallyAdjustContentInsets={false}
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
