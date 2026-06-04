import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import OnboardingWebViewScreen from '../screens/OnboardingWebViewScreen';
import { WEB_URL } from '../config/env';

export type RootStackParamList = {
  OnboardingWebView: { url: string };
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const ONBOARDING_URL = `${WEB_URL}/onboarding`;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
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
