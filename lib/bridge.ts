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
