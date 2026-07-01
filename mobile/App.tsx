import * as SplashScreenExpo from 'expo-splash-screen';
// TODO: 오픈 전에 expo-screen-capture 재설치 후 주석 해제
// import * as ScreenCapture from 'expo-screen-capture';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

SplashScreenExpo.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  // TODO: 오픈 전에 아래 코드 주석 해제 (캡쳐 방지)
  // useEffect(() => {
  //   ScreenCapture.preventScreenCaptureAsync();
  //   return () => { ScreenCapture.allowScreenCaptureAsync(); };
  // }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } finally {
        setAppReady(true);
        await SplashScreenExpo.hideAsync();
      }
    }
    prepare();
  }, []);

  const onSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  if (!appReady) return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;

  if (!splashDone) return (
    <SafeAreaProvider>
      <SplashScreen onFinish={onSplashFinish} />
    </SafeAreaProvider>
  );

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
