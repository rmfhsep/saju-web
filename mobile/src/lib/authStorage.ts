import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 웹(WebView)의 localStorage.auth_token을 네이티브에 미러링해둔다.
 * 앱 콜드 스타트 시 온보딩 웹뷰를 거치지 않고 곧바로 Home을 초기 라우트로
 * 고를 수 있도록 하기 위한 용도 — 실제 인증 검증은 여전히 웹(app/page.tsx)이
 * /api/auth/me 로 매번 다시 하고, 토큰이 유효하지 않으면 Landing으로 되돌아간다.
 */
const AUTH_TOKEN_KEY = 'saju_auth_token';

export async function getStoredAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredAuthToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export async function clearStoredAuthToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}
