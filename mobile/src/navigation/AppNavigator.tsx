import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import OnboardingWebViewScreen from '../screens/OnboardingWebViewScreen';
import { WEB_URL } from '../config/env';
import { getStoredAuthToken } from '../lib/authStorage';

export type RootStackParamList = {
  OnboardingWebView: { url: string };
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const ONBOARDING_URL = `${WEB_URL}/onboarding`;

export default function AppNavigator() {
  // 로그인된 적 있는 유저는 콜드 스타트 때 온보딩 웹뷰(+거기서 다시 Home으로 튕기는
  // 전환 애니메이션)를 거치지 않고 곧바로 Home을 초기 화면으로 띄운다. 토큰이 실제로
  // 유효한지는 Home 쪽 웹(app/page.tsx)이 /api/auth/me 로 다시 검증하고, 무효하면
  // 기존 로그아웃 경로(Landing reset)로 자연스럽게 되돌아간다.
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    getStoredAuthToken().then(token => {
      setInitialRoute(token ? 'Home' : 'OnboardingWebView');
    });
  }, []);

  if (!initialRoute) {
    return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="OnboardingWebView"
          component={OnboardingWebViewScreen}
          initialParams={{ url: ONBOARDING_URL }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
