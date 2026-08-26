import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

export type TabKey = 'recommend' | 'like' | 'message' | 'my';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'recommend', label: '추천' },
  { key: 'like', label: '호감' },
  { key: 'message', label: '메시지' },
  { key: 'my', label: '내 정보' },
];

const BAR_HEIGHT = 60;
const BAR_RADIUS = 999;
const NUM_TABS = TABS.length;
// pill 너비 = 탭 슬롯의 이 비율
const PILL_SLOT_RATIO = 0.80;

// Figma "마주 Design System" > Icon/Bottom navigation (node 151:426)와 동일한 벡터.
// stroke는 active 여부와 상관없이 항상 Gray 850(#1f1f1f) — active일 때 fill이 채워지는 것으로 상태를 구분한다.
const STROKE = '#1f1f1f';

function TabIcon({ tab, active, profilePhotoUrl, dot, scaleAnim }: {
  tab: TabKey;
  active: boolean;
  profilePhotoUrl?: string;
  dot?: boolean;
  scaleAnim: Animated.Value;
}) {
  const icon = (() => {
    switch (tab) {
      case 'recommend':
        // Figma node 151:494 (inactive) / 151:496 (active) SVG export, 그대로.
        return active ? (
          <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
            <Path d="M6.5 13.2725C6.5 12.8826 6.69846 12.5168 7.0326 12.2908L15.2659 6.7229C15.7054 6.4257 16.2946 6.4257 16.7341 6.7229L24.9674 12.2908C25.3015 12.5168 25.5 12.8826 25.5 13.2725V23.6931C25.5 24.691 24.6493 25.5 23.6 25.5H8.4C7.35066 25.5 6.5 24.691 6.5 23.6931V13.2725Z" fill="#1F1F1F" stroke="#1F1F1F" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
            <Path d="M11.25 21.3438H20.75" stroke="#EFEFEF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        ) : (
          <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
            <Path d="M11.25 21.3438H20.75M15.2659 6.7229L7.0326 12.2908C6.69846 12.5168 6.5 12.8826 6.5 13.2725V23.6931C6.5 24.691 7.35066 25.5 8.4 25.5H23.6C24.6493 25.5 25.5 24.691 25.5 23.6931V13.2725C25.5 12.8826 25.3015 12.5168 24.9674 12.2908L16.7341 6.7229C16.2946 6.4257 15.7054 6.4257 15.2659 6.7229Z" stroke="#1F1F1F" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        );
      case 'like':
        // Figma node 151:466 (inactive) / 151:468 (active) SVG export, 그대로.
        return (
          active ? (
            <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
              <Path d="M20.7727 7.30228C19.2754 7.30228 17.9112 7.89585 16.899 8.89297C16.4282 9.35671 15.5718 9.35671 15.101 8.89297C14.0888 7.89585 12.7246 7.30228 11.2273 7.30228C8.07727 7.30228 5.5 10.0378 5.5 13.3812C5.5 18.6725 13.5895 24.0419 15.5675 25.2757C15.8344 25.4421 16.1661 25.4426 16.4334 25.277C18.4131 24.051 26.5 18.7161 26.5 13.3812C26.5 10.0378 23.9227 7.30228 20.7727 7.30228Z" fill="#1F1F1F" stroke="#1F1F1F" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          ) : (
            <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
              <Path d="M20.7727 7.30228C19.2754 7.30228 17.9112 7.89585 16.899 8.89297C16.4282 9.35671 15.5718 9.35671 15.101 8.89297C14.0888 7.89585 12.7246 7.30228 11.2273 7.30228C8.07727 7.30228 5.5 10.0378 5.5 13.3812C5.5 18.6725 13.5895 24.0419 15.5675 25.2757C15.8344 25.4421 16.1661 25.4426 16.4334 25.277C18.4131 24.051 26.5 18.7161 26.5 13.3812C26.5 10.0378 23.9227 7.30228 20.7727 7.30228Z" stroke="#1F1F1F" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          )
        );
      case 'message':
        // Figma node 151:438 (inactive) / 151:449 (active) SVG export, 그대로.
        return (
       active ? (
        <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
          <Path d="M25.2426 19.82C25.7295 18.6431 25.9981 17.3529 25.9981 16C25.9981 10.4772 21.5214 6 15.9991 6C10.4767 6 6 10.4772 6 16C6 21.5228 10.4767 26 15.9991 26C17.6587 26 19.224 25.5956 20.6016 24.88C20.7906 24.7818 21.0084 24.751 21.2149 24.8027L24.7977 25.6984C25.3718 25.842 25.9084 25.358 25.8247 24.7722L25.1825 20.2759C25.1604 20.1214 25.183 19.9642 25.2426 19.82Z" fill="#1F1F1F" stroke="#1F1F1F" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
       ) : (
        <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
          <Path d="M25.2426 19.82C25.7295 18.6431 25.9981 17.3529 25.9981 16C25.9981 10.4772 21.5214 6 15.9991 6C10.4767 6 6 10.4772 6 16C6 21.5228 10.4767 26 15.9991 26C17.6587 26 19.224 25.5956 20.6016 24.88C20.7906 24.7818 21.0084 24.751 21.2149 24.8027L24.7977 25.6984C25.3718 25.842 25.9084 25.358 25.8247 24.7722L25.1825 20.2759C25.1604 20.1214 25.183 19.9642 25.2426 19.82Z" stroke="#1F1F1F" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
       )
        );
      case 'my':
        if (profilePhotoUrl) {
          return (
            <Image
              source={{ uri: profilePhotoUrl }}
              style={[styles.profilePhoto, active && styles.profilePhotoActive]}
            />
          );
        }
        return (
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Circle cx={10} cy={6.5} r={3.5} stroke={STROKE} strokeWidth={1.5} />
            <Path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
        );
    }
  })();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View>
        {icon}
        {dot && <View style={styles.dot} />}
      </View>
    </Animated.View>
  );
}

export default function LiquidTabBar({
  active,
  onPress,
  profilePhotoUrl,
  hasNewLike,
  hasNewMessage,
}: {
  active: TabKey | null;
  onPress: (tab: TabKey) => void;
  profilePhotoUrl?: string;
  hasNewLike?: boolean;
  hasNewMessage?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const activeIdx = Math.max(0, active ? TABS.findIndex(t => t.key === active) : 0);
  const prevIdx = useRef(activeIdx);

  // ── pill 위치 ──────────────────────────────────────────────
  // paddingHorizontal 없이 barContainer 전체 너비 기준으로 계산
  // 슬롯 25%, pill 80% of slot → pill 20%, margin 2.5% 양쪽
  const slotPct = 100 / NUM_TABS;
  const pillPct = slotPct * PILL_SLOT_RATIO;
  const marginPct = (slotPct - pillPct) / 2;

  const pillLeft = useRef(
    new Animated.Value(activeIdx * slotPct + marginPct),
  ).current;

  // ── 아이콘 scale ───────────────────────────────────────────
  const scaleAnims = useRef(
    TABS.reduce<Record<TabKey, Animated.Value>>((acc, tab, i) => {
      acc[tab.key] = new Animated.Value(i === activeIdx ? 1 : 0.88);
      return acc;
    }, {} as Record<TabKey, Animated.Value>),
  ).current;

  // ── 탭바 전체 wobble scale ──────────────────────────────────
  const barScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // pill 이동 — 낮은 friction으로 오버슈트
    Animated.spring(pillLeft, {
      toValue: activeIdx * slotPct + marginPct,
      useNativeDriver: false,
      tension: 260,
      friction: 15,
      overshootClamping: false,
    }).start();

    // 탭바 wrapper 출렁: 살짝 눌렸다가 튀어나오는 효과
    Animated.sequence([
      Animated.timing(barScale, {
        toValue: 0.97,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(barScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 380,
        friction: 11,
      }),
    ]).start();

    // 아이콘 팝: 새 탭 → 축소 후 spring, 이전 탭 → 소폭 축소
    TABS.forEach((tab, i) => {
      if (i === activeIdx) {
        Animated.sequence([
          Animated.timing(scaleAnims[tab.key], {
            toValue: 0.78,
            duration: 55,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnims[tab.key], {
            toValue: 1,
            useNativeDriver: true,
            tension: 420,
            friction: 11,
          }),
        ]).start();
      } else if (i === prevIdx.current) {
        Animated.spring(scaleAnims[tab.key], {
          toValue: 0.88,
          useNativeDriver: true,
          tension: 280,
          friction: 20,
        }).start();
      }
    });

    prevIdx.current = activeIdx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const bottomPad = insets.bottom || 0;

  const pillAnimStyle = [
    styles.pill,
    { width: `${pillPct}%` as `${number}%` },
    {
      left: pillLeft.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
      }),
    },
  ];

  function handlePress(tab: TabKey) {
    // 햅틱 피드백 (iOS selection 스타일)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress(tab);
  }

  // 탭 버튼 공통 렌더
  const tabButtons = (
    <View style={styles.tabRow}>
      {TABS.map((tab, idx) => {
        const isActive = activeIdx === idx;
        return (
          <Pressable
            key={tab.key}
            onPress={() => handlePress(tab.key)}
            style={styles.tabButton}
            hitSlop={{ top: 8, bottom: 8, left: 2, right: 2 }}
          >
            <TabIcon
              tab={tab.key}
              active={isActive}
              profilePhotoUrl={profilePhotoUrl}
              dot={tab.key === 'like' ? hasNewLike : tab.key === 'message' ? hasNewMessage : false}
              scaleAnim={scaleAnims[tab.key]}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: bottomPad + 8 }]}
    >
      <Animated.View style={[styles.barOuter, { transform: [{ scale: barScale }] }]}>
        <View style={styles.barContainer}>
          <BlurView intensity={85} tint="light" style={styles.bar}>
            <View style={[StyleSheet.absoluteFill, styles.glassTint]} />
            <Animated.View style={[pillAnimStyle, styles.fallbackPill]} />
            {tabButtons}
          </BlurView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 12,
  },
  // barScale 애니메이션을 위한 래퍼
  barOuter: {
    width: '100%',
    maxWidth: 430,
  },
  barContainer: {
    width: '100%',
    borderRadius: BAR_RADIUS,
    position: 'relative',
    // 그림자는 overflow:hidden인 bar(블러 클립용)가 아니라 여기서 그려야 안 잘림
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    overflow: 'hidden',
    // paddingHorizontal 제거 — pill % 기준과 통일시켜 정렬 맞춤
  },
  // 블러 위에 아주 옅은 흰색만 얹어 톤을 맞춘다 — 진하게 얹으면 블러 자체가 죽어버린다.
  glassTint: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabRow: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
    // 탭 버튼들이 바 전체 너비에 걸쳐 균등하게 분배됨
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    zIndex: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    color: '#8e8e93',
    lineHeight: 12,
    textAlign: 'center',
  },
  labelActive: {
    color: '#1f1f1f',
    fontWeight: '600',
  },
  profilePhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  profilePhotoActive: {
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  // Figma: Atomic/Red/Red 550 (#FF4242), 6px, 아이콘 우상단
  dot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff4242',
  },
  pill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: BAR_RADIUS,
  },
  fallbackPill: {
    backgroundColor: '#efefef',
  },
});
