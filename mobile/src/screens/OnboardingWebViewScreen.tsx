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
import { WEB_URL } from '../config/env';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingWebView'>;
  route: RouteProp<RootStackParamList, 'OnboardingWebView'>;
};

const SCREEN_PATHS: Record<string, string> = {
  BirthInfo: '/onboarding/birth-info',
  SajuResult: '/onboarding/result',
  MatchPreview: '/onboarding/matches',
  Blocking: '/onboarding/blocking',
  ProfileSetup: '/onboarding/profile',
};

function buildUrl(path: string, params?: Record<string, string>): string {
  const base = WEB_URL.endsWith('/') ? WEB_URL.slice(0, -1) : WEB_URL;
  const url = `${base}${path}`;
  if (!params || Object.keys(params).length === 0) return url;
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return `${url}?${qs}`;
}

export default function OnboardingWebViewScreen({ navigation, route }: Props) {
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
          `window.__onContactsReceived && window.__onContactsReceived([]); true;`
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
        onLoadEnd={() => setLoading(false)}
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
