/**
 * Bridge utilities for React Native WebView ↔ Next.js communication.
 * In WebView: sends postMessage to React Native.
 * In browser: falls back to URL / history navigation.
 */

type RNWebView = { postMessage: (msg: string) => void }

function getRN(): RNWebView | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { ReactNativeWebView?: RNWebView }).ReactNativeWebView
}

export const SCREEN_PATHS: Record<string, string> = {
  PhoneInput:   '/onboarding/phone',
  Verify:       '/onboarding/verify',
  Login:        '/onboarding/login',
  Landing:      '/onboarding',
  BirthInfo:    '/onboarding/birth-info',
  SajuResult:   '/onboarding/result',
  MatchPreview: '/onboarding/matches',
  Blocking:     '/onboarding/blocking',
  ProfileSetup: '/onboarding/profile',
  Filter:       '/onboarding/filter',
  Home:         '/',
}

/** Navigate forward — pushes a new screen onto the stack. */
export function bridgeNavigate(screen: string, params?: Record<string, string>) {
  const rn = getRN()
  if (rn) {
    rn.postMessage(JSON.stringify({ type: 'navigate', screen, params }))
    return
  }
  // Browser fallback
  const path = SCREEN_PATHS[screen] ?? '/'
  const url = new URL(path, window.location.origin)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  window.location.href = url.toString()
}

/**
 * Navigate to a screen and also force the current WebView to change its URL.
 * bridgeNavigate's postMessage only triggers a native push for screens the
 * RN app recognizes (BirthInfo, Blocking, ProfileSetup, ...). Auth-flow
 * screens (PhoneInput/Verify/Login/Landing) live entirely inside the initial
 * WebView and aren't registered natively, so without this forced replace the
 * WebView would stay on the old screen.
 */
export function navigateAndReplace(screen: string, params?: Record<string, string>) {
  bridgeNavigate(screen, params)
  const path = SCREEN_PATHS[screen] ?? '/'
  const url = new URL(path, window.location.origin)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  window.location.replace(url.toString())
}

/** Go back — pops the current screen off the stack. */
export function bridgeBack() {
  const rn = getRN()
  if (rn) {
    rn.postMessage(JSON.stringify({ type: 'back' }))
    return
  }
  window.history.back()
}

/**
 * Request the native layer to read contacts and return phone numbers.
 * Native responds by calling window.__onContactsReceived(phones: string[]).
 */
export function bridgeRequestContacts() {
  const rn = getRN()
  if (rn) {
    rn.postMessage(JSON.stringify({ type: 'requestContacts' }))
  }
}

/** Register a one-time handler for contacts returned from native. */
export function onContactsReceived(callback: (phones: string[]) => void) {
  if (typeof window === 'undefined') return
  ;(window as Window & { __onContactsReceived?: (phones: string[]) => void }).__onContactsReceived = callback
}

/** Register a one-time handler for native contacts-permission denial. */
export function onContactsPermissionDenied(callback: () => void) {
  if (typeof window === 'undefined') return
  ;(window as Window & { __onContactsPermissionDenied?: () => void }).__onContactsPermissionDenied = callback
}

/** Ask the native layer to open the OS app-settings screen (for toggling notifications). */
export function bridgeOpenAppSettings() {
  const rn = getRN()
  if (rn) {
    rn.postMessage(JSON.stringify({ type: 'openAppSettings' }))
  }
}

/**
 * Tell the native layer whether the bottom tab bar (GNB) should be visible.
 * Sub-pages navigate client-side within the same WebView, so the native app
 * can't detect the route change on its own — the web sends this on every
 * route change (visible only on the main tab roots).
 * No-op in a plain browser (getRN() is undefined).
 */
export function bridgeSetTabBar(visible: boolean) {
  const rn = getRN()
  if (rn) {
    rn.postMessage(JSON.stringify({ type: 'setTabBar', visible }))
  }
}

/**
 * Register a handler for the FCM device token pushed from native once it
 * registers for push notifications (e.g. after the user grants permission).
 * Native responds by calling window.__onPushTokenReceived(token: string).
 */
export function onPushTokenReceived(callback: (token: string) => void) {
  if (typeof window === 'undefined') return
  ;(window as Window & { __onPushTokenReceived?: (token: string) => void }).__onPushTokenReceived = callback
}

/**
 * 로그인 성공 시 토큰을 네이티브에 즉시 미러링한다 — 네이티브가 이 토큰을 로컬에
 * 저장해두고, 다음 앱 콜드 스타트 때 온보딩 웹뷰를 거치지 않고 곧바로 Home을
 * 초기 화면으로 띄우는 데 쓴다(HomeScreen도 로드 시점마다 같은 메시지를 보내지만,
 * 로그인 직후처럼 SPA 네비게이션만 일어나 리로드가 없는 경우를 위한 명시적 호출).
 */
export function bridgeSyncAuthToken(token: string) {
  const rn = getRN()
  if (rn) {
    rn.postMessage(JSON.stringify({ type: 'authToken', token }))
  }
}

/** Open the native SMS app with recipient and body pre-filled. */
export function bridgeOpenSms(phone: string, body: string) {
  const rn = getRN()
  if (rn) {
    rn.postMessage(JSON.stringify({ type: 'openSms', phone, body }))
    return
  }
  // Browser fallback
  window.location.href = `sms:${phone}?body=${encodeURIComponent(body)}`
}
