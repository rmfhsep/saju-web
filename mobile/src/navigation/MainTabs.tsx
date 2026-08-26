import React, { useEffect, useRef, useState } from 'react';
import { PixelRatio, View } from 'react-native';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import Svg, { Circle, ClipPath, Defs, Image as SvgImage } from 'react-native-svg';
import { File, Paths } from 'expo-file-system';
import TabWebViewScreen, { TabKey } from '../screens/TabWebViewScreen';
import { HomeTabsProvider, useHomeTabsContext } from './HomeTabsContext';
import { subscribeToTokenRefresh } from '../lib/push';

// 형제 아이콘들과 전체 캔버스 크기(32pt)를 맞추되, 원은 캔버스에 꽉 채우지 않고
// 사방 4pt 여백을 둔다 — 32를 꽉 채우면 선 굵기 위주인 다른 아이콘들보다 훨씬
// 무거워 보여서, 실제 원 지름은 32-4*2=24pt로 형제 아이콘들과 비슷한 시각적 크기를 맞춘다.
// SVG는 이 값 그대로(고화질) 그리고, 표시 크기는 이미지 소스의 scale 힌트로 맞춘다
// (아래 useCircularAvatarUris 설명 참고).
const AVATAR_SIZE = 32;
const AVATAR_PADDING = 4;
const AVATAR_BORDER_WIDTH = 1.5;

/** 실제로 WebView를 미리 마운트해서 캐싱할 탭들 */
const TABS: { key: TabKey; path: string; label: string }[] = [
  { key: 'recommend', path: '/', label: '추천' },
  { key: 'like', path: '/likes', label: '호감' },
  { key: 'message', path: '/messages', label: '메시지' },
  { key: 'my', path: '/my', label: '내 정보' },
];

type TabParamList = {
  recommend: undefined;
  like: undefined;
  message: undefined;
  my: undefined;
};

const Tab = createNativeBottomTabNavigator<TabParamList>();

// LiquidTabBar.tsx에서 쓰던 Figma 아이콘 그대로 PNG로 래스터화한 것 (scripts는 일회성이라 커밋 안 함).
const TAB_ICONS: Record<TabKey, { active: number; inactive: number }> = {
  recommend: {
    active: require('../assets/tab-icons/recommend-active.png'),
    inactive: require('../assets/tab-icons/recommend-inactive.png'),
  },
  like: {
    active: require('../assets/tab-icons/like-active.png'),
    inactive: require('../assets/tab-icons/like-inactive.png'),
  },
  message: {
    active: require('../assets/tab-icons/message-active.png'),
    inactive: require('../assets/tab-icons/message-inactive.png'),
  },
  my: {
    active: require('../assets/tab-icons/my-fallback.png'),
    inactive: require('../assets/tab-icons/my-fallback.png'),
  },
};

/** 원격 프로필 사진 URL을 로컬 파일로 내려받는다 — 네이티브 탭 아이콘은 원격 URI를 못 받는다. */
function useLocalProfileIconUri(remoteUrl: string | undefined): string | undefined {
  const [localUri, setLocalUri] = useState<string | undefined>();

  useEffect(() => {
    if (!remoteUrl) return;
    let cancelled = false;
    (async () => {
      try {
        // Paths.cache는 시스템이 항상 존재를 보장하는 루트 디렉토리라 별도 서브폴더
        // 생성 없이 바로 받는다 (Directory.create가 이 버전 API에 없어 조용히 실패했었다).
        // idempotent:true 필수 — URL의 파일명이 고정이라, 이전 세션에서 이미 같은
        // 이름으로 받아둔 파일이 캐시에 남아있으면 기본값(false)에선 "Destination
        // already exists" 에러로 다운로드 자체가 실패한다.
        const file = await File.downloadFileAsync(remoteUrl, Paths.cache, { idempotent: true });
        console.log('[MainTabs] profile icon downloaded:', file.uri);
        if (!cancelled) setLocalUri(file.uri);
      } catch (err) {
        // 다운로드 실패 시 기본 아이콘으로 폴백
        console.warn('[MainTabs] profile icon download failed:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [remoteUrl]);

  return localUri;
}

type CircularAvatarUris = { plain?: string; active?: string };

/**
 * 다운로드한 원본 사진을 원형 클립(+active일 때 흰 테두리)까지 입힌 실제 PNG로 구워낸다.
 * 네이티브 탭 아이콘(NativeBottomTabIcon)은 style을 못 받는 순수 이미지 소스라
 * borderRadius/border를 RN 스타일로 줄 수 없어서, react-native-svg의 toDataURL로
 * 화면 밖에서 렌더링한 SVG를 픽셀 그대로 캡처한다.
 *
 * react-native-svg의 toDataURL(옵션 없이 호출)은 SVG를 "기기 화면 배율(PixelRatio,
 * 보통 3x)"로 캡처한다 — 즉 AVATAR_SIZE(pt)로 그리면 PNG는 AVATAR_SIZE*scale 픽셀이
 * 나온다. 예전엔 이걸 SVG 자체를 1/scale로 줄여 그려서 "픽셀 수 = pt"로 맞췄는데,
 * 그러면 사진이 실제로 1x 해상도로만 캡처돼(3배 저해상도) 화질이 뭉개지고 흰
 * 테두리도 두께가 1~2px밖에 안 남아 지글거렸다.
 * 그래서 지금은 SVG를 AVATAR_SIZE 그대로(고화질 3x 캡처) 그리고, 대신 이미지
 * 소스에 RN 표준 `scale` 필드를 실어 보낸다 — ImageSourcePropType이 원래 지원하는
 * `{ uri, scale }` 힌트라서(@2x/@3x 파일명 대신 쓰는 방식), 네이티브가 이 스케일로
 * "픽셀 수 ÷ scale = pt"를 계산해 크기는 AVATAR_SIZE로 정확히 나오면서 픽셀 데이터는
 * 3x 그대로 유지돼 사진도 테두리도 선명하게 보인다.
 * (LiquidTabBar.tsx의 profilePhoto/profilePhotoActive 스타일을 이 방식으로 재현)
 */
function useCircularAvatarUris(localPhotoUri: string | undefined): {
  uris: CircularAvatarUris;
  capturer: React.ReactNode;
} {
  const [uris, setUris] = useState<CircularAvatarUris>({});
  const plainRef = useRef<Svg>(null);
  const activeRef = useRef<Svg>(null);

  function capturePlain() {
    plainRef.current?.toDataURL(base64 => {
      console.log('[MainTabs] avatar plain captured, base64 length:', base64?.length);
      setUris(prev => ({ ...prev, plain: `data:image/png;base64,${base64}` }));
    });
  }
  function captureActive() {
    activeRef.current?.toDataURL(base64 => {
      console.log('[MainTabs] avatar active captured, base64 length:', base64?.length);
      setUris(prev => ({ ...prev, active: `data:image/png;base64,${base64}` }));
    });
  }

  useEffect(() => {
    setUris({});
    if (!localPhotoUri) return;
    // onLoad가 오면 그때 캡처하지만(빠른 경로), 로컬 file:// 소스는 이미 캐시돼 있어
    // 로드 이벤트가 아예 안 붙는 경우가 있어 보험으로 약간의 지연 뒤 한 번 더 캡처한다
    // — 이미 값이 있으면 같은 결과로 덮어쓸 뿐이라 무해하다.
    const timer = setTimeout(() => {
      capturePlain();
      captureActive();
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPhotoUri]);

  if (!localPhotoUri) {
    return { uris, capturer: null };
  }

  const size = AVATAR_SIZE;
  const center = size / 2;
  const borderWidth = AVATAR_BORDER_WIDTH;
  // 캔버스는 형제 아이콘과 같은 32pt를 쓰되, 원 자체는 사방 AVATAR_PADDING만큼
  // 안쪽으로 들어간 자리에서 "꽉 채워" 그린다 (32 전체를 채우면 다른 선 굵기
  // 위주 아이콘보다 훨씬 커/무거워 보인다).
  const circleR = center - AVATAR_PADDING;
  const innerR = circleR - borderWidth;
  const capturer = (
    <View style={{ position: 'absolute', top: -9999, left: -9999 }} pointerEvents="none">
      <Svg ref={plainRef} width={size} height={size}>
        <Defs>
          <ClipPath id="avatar-clip-plain">
            <Circle cx={center} cy={center} r={circleR} />
          </ClipPath>
        </Defs>
        <Circle cx={center} cy={center} r={circleR} fill="#e0e0e0" />
        <SvgImage
          href={{ uri: localPhotoUri }}
          x={center - circleR}
          y={center - circleR}
          width={circleR * 2}
          height={circleR * 2}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#avatar-clip-plain)"
          onLoad={capturePlain}
        />
      </Svg>
      <Svg ref={activeRef} width={size} height={size}>
        <Defs>
          <ClipPath id="avatar-clip-active">
            <Circle cx={center} cy={center} r={innerR} />
          </ClipPath>
        </Defs>
        <Circle cx={center} cy={center} r={innerR} fill="#e0e0e0" />
        <SvgImage
          href={{ uri: localPhotoUri }}
          x={center - innerR}
          y={center - innerR}
          width={innerR * 2}
          height={innerR * 2}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#avatar-clip-active)"
          onLoad={captureActive}
        />
        <Circle
          cx={center}
          cy={center}
          r={circleR - borderWidth / 2}
          stroke="#ffffff"
          strokeWidth={borderWidth}
          fill="none"
        />
      </Svg>
    </View>
  );

  return { uris, capturer };
}

function MainTabsInner() {
  const { profilePhotoUrl, webViewRefs } = useHomeTabsContext();
  const localProfileIconUri = useLocalProfileIconUri(profilePhotoUrl);
  const { uris: avatarUris, capturer } = useCircularAvatarUris(localProfileIconUri);

  useEffect(() => {
    console.log('[MainTabs] state:', { profilePhotoUrl, localProfileIconUri, avatarUris });
  }, [profilePhotoUrl, localProfileIconUri, avatarUris]);

  // 토큰이 앱 사용 중 갱신되면 다시 웹으로 전달 (recommend 탭 WebView 기준) — 탭 전체에 하나만 필요.
  useEffect(() => {
    const unsubscribe = subscribeToTokenRefresh(() => webViewRefs.current.recommend ?? null);
    return unsubscribe;
  }, [webViewRefs]);

  return (
    <>
      {capturer}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#1f1f1f',
          tabBarInactiveTintColor: '#8e8e93',
        }}
      >
        {TABS.map(tab => (
          <Tab.Screen
            key={tab.key}
            name={tab.key}
            options={{
              tabBarLabel: tab.label,
              tabBarIcon: ({ focused }: { focused: boolean }) => {
                if (tab.key === 'my') {
                  const avatarUri = focused ? avatarUris.active : avatarUris.plain;
                  if (avatarUri) {
                    // 3x 고화질로 캡처된 이미지라 scale을 명시해야 AVATAR_SIZE(pt)로
                    // 정확히 표시된다 — 안 주면 "픽셀 수 = pt"로 취급돼 3배 커진다.
                    // 이미 원형 클립 + (active일 때) 흰 테두리까지 구워진 이미지라 tint 금지.
                    return {
                      type: 'image',
                      source: { uri: avatarUri, scale: PixelRatio.get() },
                      tinted: false,
                    };
                  }
                }
                const icons = TAB_ICONS[tab.key];
                // 아이콘 자체가 이미 active(채움)/inactive(외곽선)를 색으로 구분해 그려져 있으므로
                // 기본값(tinted:true)으로 시스템이 재색칠하면 그 구분과 실제 색이 사라진다.
                return { type: 'image', source: focused ? icons.active : icons.inactive, tinted: false };
              },
            }}
          >
            {() => <TabWebViewScreen tabKey={tab.key} path={tab.path} />}
          </Tab.Screen>
        ))}
      </Tab.Navigator>
    </>
  );
}

export default function MainTabs() {
  return (
    <HomeTabsProvider>
      <MainTabsInner />
    </HomeTabsProvider>
  );
}
