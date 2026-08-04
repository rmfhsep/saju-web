import { Platform, PermissionsAndroid } from 'react-native';
import {
  getMessaging,
  getToken,
  requestPermission,
  onTokenRefresh,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import type WebView from 'react-native-webview';

/** 웹의 window.__onPushTokenReceived(token) 으로 FCM 토큰을 전달한다. */
function injectToken(webViewRef: WebView | null, token: string) {
  webViewRef?.injectJavaScript(
    `window.__onPushTokenReceived && window.__onPushTokenReceived(${JSON.stringify(token)}); true;`,
  );
}

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
  }

  const messaging = getMessaging();
  const authStatus = await requestPermission(messaging);
  return (
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL
  );
}

/**
 * 알림 권한을 요청하고, 허용되면 FCM 토큰을 발급받아 웹으로 전달한다.
 * 이후 토큰이 갱신될 때도 자동으로 다시 전달한다.
 * 웹은 window.__onPushTokenReceived(token) 을 받아 /api/push/register-token 에 등록한다.
 */
export async function registerForPushNotifications(webViewRef: WebView | null) {
  try {
    const enabled = await ensurePermission();
    if (!enabled) return;

    const messaging = getMessaging();
    const token = await getToken(messaging);
    injectToken(webViewRef, token);
  } catch (err) {
    console.warn('[push] registration failed:', err);
  }
}

/** 토큰 갱신(재설치, 캐시 초기화 등) 시 다시 웹으로 전달하는 리스너를 등록한다. */
export function subscribeToTokenRefresh(getWebViewRef: () => WebView | null) {
  const messaging = getMessaging();
  return onTokenRefresh(messaging, token => {
    injectToken(getWebViewRef(), token);
  });
}
