import * as SplashScreenExpo from 'expo-splash-screen';
import * as ScreenCapture from 'expo-screen-capture';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

SplashScreenExpo.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync();
    return () => { ScreenCapture.allowScreenCaptureAsync(); };
  }, []);

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
