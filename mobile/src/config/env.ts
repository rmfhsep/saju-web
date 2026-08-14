import { Platform } from 'react-native';

// 'localhost'는 iOS 시뮬레이터에서만 맥(호스트)을 가리킨다 — 실기기에서는 기기 자신을
// 가리켜서 dev 서버에 연결이 안 된다. 실기기 테스트 시엔 맥의 LAN IP가 필요하다
// (맥 터미널에서 `ipconfig getifaddr en0`으로 확인, 네트워크 바뀌면 갱신 필요).
const MAC_LAN_IP = '192.168.0.24';
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : MAC_LAN_IP;

export const WEB_URL =
  __DEV__ ? `http://${DEV_HOST}:3000` : 'https://saju-agent-three.vercel.app';
