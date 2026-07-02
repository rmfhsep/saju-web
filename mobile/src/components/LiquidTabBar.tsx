import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import {
  LiquidGlassContainerView,
  LiquidGlassView,
  isLiquidGlassSupported,
} from '@callstack/liquid-glass';

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

const AnimatedLiquidGlassView = Animated.createAnimatedComponent(LiquidGlassView);

function TabIcon({ tab, active, profilePhotoUrl, scaleAnim }: {
  tab: TabKey;
  active: boolean;
  profilePhotoUrl?: string;
  scaleAnim: Animated.Value;
}) {
  const color = active ? '#1f1f1f' : '#8e8e93';

  const icon = (() => {
    switch (tab) {
      case 'recommend':
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Path
              d="M2 9.5L11 2l9 7.5V20a1 1 0 01-1 1H14v-6H8v6H3a1 1 0 01-1-1V9.5z"
              stroke={color} strokeWidth={1.6} strokeLinejoin="round"
              fill={active ? color : 'none'}
            />
          </Svg>
        );
      case 'like':
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Path
              d="M11 19S3 13.8 3 7.8C3 5 5.2 3 7.8 3c1.3 0 2.5.7 3.2 1.8C11.7 3.7 12.9 3 14.2 3 16.8 3 19 5 19 7.8 19 13.8 11 19 11 19z"
              stroke={color} strokeWidth={1.6} strokeLinejoin="round"
            />
          </Svg>
        );
      case 'message':
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Path
              d="M4 4h14a1 1 0 011 1v9a1 1 0 01-1 1H8.5L4 18.5V15a1 1 0 01-1-1V5a1 1 0 011-1z"
              stroke={color} strokeWidth={1.6} strokeLinejoin="round"
            />
          </Svg>
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
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Circle cx={11} cy={7.5} r={4} stroke={color} strokeWidth={1.6} />
            <Path d="M3 19c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
          </Svg>
        );
    }
  })();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {icon}
    </Animated.View>
  );
}

export default function LiquidTabBar({
  active,
  onPress,
  profilePhotoUrl,
}: {
  active: TabKey | null;
  onPress: (tab: TabKey) => void;
  profilePhotoUrl?: string;
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
  const supported = isLiquidGlassSupported && Platform.OS === 'ios';

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
        {supported ? (
          <LiquidGlassContainerView spacing={12} style={styles.barContainer}>
            <LiquidGlassView
              effect="regular"
              colorScheme="light"
              style={styles.bar}
            >
              {tabButtons}
            </LiquidGlassView>
            <AnimatedLiquidGlassView
              effect="clear"
              colorScheme="light"
              interactive
              style={pillAnimStyle}
            />
          </LiquidGlassContainerView>
        ) : (
          <View style={[styles.barContainer, styles.fallbackBg]}>
            <View style={styles.bar}>
              <AnimatedLiquidGlassView
                effect="none"
                style={[pillAnimStyle, styles.fallbackPill]}
              />
              {tabButtons}
            </View>
          </View>
        )}
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
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    overflow: 'visible',
    // paddingHorizontal 제거 — pill % 기준과 통일시켜 정렬 맞춤
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
    borderColor: '#1a75ff',
  },
  pill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: BAR_RADIUS,
  },
  fallbackBg: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  fallbackPill: {
    backgroundColor: '#efefef',
  },
});
