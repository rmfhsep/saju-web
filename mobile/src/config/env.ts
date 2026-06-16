import { Platform } from 'react-native';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const WEB_URL =
  __DEV__ ? `http://${DEV_HOST}:3000` : 'https://saju-agent-three.vercel.app';
