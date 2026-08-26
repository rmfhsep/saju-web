import React, { createContext, useContext, useRef, useState } from 'react';
import type WebView from 'react-native-webview';
import type { TabKey } from '../screens/TabWebViewScreen';

type HomeTabsContextValue = {
  webViewRefs: React.MutableRefObject<Partial<Record<TabKey, WebView | null>>>;
  profilePhotoUrl: string | undefined;
  setProfilePhotoUrl: (url: string) => void;
  pushRegisteredRef: React.MutableRefObject<boolean>;
};

const HomeTabsContext = createContext<HomeTabsContextValue | null>(null);

/** 4개 탭 화면(각자 독립된 Tab.Screen)이 공유해야 하는 상태 — 프로필 사진, 웹뷰 ref, 푸시 등록 여부. */
export function HomeTabsProvider({ children }: { children: React.ReactNode }) {
  const webViewRefs = useRef<Partial<Record<TabKey, WebView | null>>>({});
  const pushRegisteredRef = useRef(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | undefined>();

  return (
    <HomeTabsContext.Provider value={{ webViewRefs, profilePhotoUrl, setProfilePhotoUrl, pushRegisteredRef }}>
      {children}
    </HomeTabsContext.Provider>
  );
}

export function useHomeTabsContext(): HomeTabsContextValue {
  const ctx = useContext(HomeTabsContext);
  if (!ctx) throw new Error('useHomeTabsContext must be used within HomeTabsProvider');
  return ctx;
}
