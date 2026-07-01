import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Linking, Platform, StyleSheet, View } from 'react-native';
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

const TAB_PATHS: Record<TabKey, string | null> = {
  recommend: '/',
  like: null,
  message: null,
  my: '/my',
};

function pathToTab(url: string): TabKey | null {
  const path = url.replace(WEB_URL, '').split('?')[0] || '/';
  if (path === '/') return 'recommend';
  if (path.startsWith('/my')) return 'my';
  return null;
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [uri, setUri] = useState(WEB_URL);
  const [activeTab, setActiveTab] = useState<TabKey | null>('recommend');

  ScreenCapture.usePreventScreenCapture();

  React.useEffect(() => {
    const sub = ScreenCapture.addScreenshotListener(() => {
      Alert.alert('캡쳐 불가', '이 화면은 개인정보 보호를 위해 캡쳐가 제한됩니다.', [{ text: '확인' }]);
    });
    return () => sub.remove();
  }, []);

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
    }, [])
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
      webViewRef.current?.injectJavaScript(`window.__onContactsReceived && window.__onContactsReceived([]); true;`);
    }
  }

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'back') {
        webViewRef.current?.goBack();
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
      if (data.type !== 'navigate') return;

      // 탭 경로(추천/내 정보)는 같은 웹뷰에서 URL만 바꿔서 보여준다.
      const tabPath = data.screen === 'Home' ? '/' : null;
      if (tabPath) {
        setUri(buildUrl(tabPath));
        setActiveTab(pathToTab(buildUrl(tabPath)));
        return;
      }

      // 그 외(필터/지인차단 등) 화면은 별도 스택으로 쌓아 뒤로가기가 가능하게 한다.
      const path = SCREEN_PATHS[data.screen];
      if (path) {
        navigation.push('OnboardingWebView', { url: buildUrl(path, data.params) });
      }
    } catch {
      // ignore malformed messages
    }
  }

  function handleNavigationStateChange(navState: WebViewNavigation) {
    setActiveTab(pathToTab(navState.url));
  }

  function handleTabPress(tab: TabKey) {
    const path = TAB_PATHS[tab];
    if (!path) {
      Alert.alert('준비 중이에요', '곧 만나볼 수 있어요.');
      return;
    }
    setUri(buildUrl(path));
    setActiveTab(tab);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAwareWebView
        ref={webViewRef}
        source={{ uri }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        startInLoadingState={false}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      )}
      <LiquidTabBar active={activeTab} onPress={handleTabPress} />
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
