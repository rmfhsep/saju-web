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
// 바 내부 좌우 패딩 — pill이 바 끝에 붙지 않도록
const BAR_INNER_PADDING = 6;
// pill은 탭 슬롯의 이 비율만큼 (양쪽에 gap)
const PILL_SLOT_RATIO = 0.82;

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
  const activeIdx = active ? TABS.findIndex(t => t.key === active) : 0;
  const prevIdx = useRef(activeIdx);

  // --- pill 위치 애니메이션 ---
  // left: 탭 슬롯 % + 슬롯 안 중앙 정렬을 위한 offset
  // pill 폭 = 25% * PILL_SLOT_RATIO → 남은 공간 / 2 씩 양쪽 margin
  const slotPct = 100 / TABS.length;                          // 25%
  const pillWidthPct = slotPct * PILL_SLOT_RATIO;             // ~20.5%
  const pillMarginPct = (slotPct - pillWidthPct) / 2;         // ~2.25%

  const pillLeft = useRef(new Animated.Value(activeIdx * slotPct + pillMarginPct)).current;

  // --- 아이콘 scale 애니메이션 (탭당 하나씩) ---
  const scaleAnims = useRef(
    TABS.reduce<Record<TabKey, Animated.Value>>((acc, tab) => {
      acc[tab.key] = new Animated.Value(tab.key === active ? 1 : 0.88);
      return acc;
    }, {} as Record<TabKey, Animated.Value>),
  ).current;

  useEffect(() => {
    // pill 이동 — friction 낮춰서 오버슈트(출렁) 효과
    Animated.spring(pillLeft, {
      toValue: activeIdx * slotPct + pillMarginPct,
      useNativeDriver: false,
      tension: 280,
      friction: 16,   // 낮을수록 더 출렁임 (12~18 추천)
      overshootClamping: false,
    }).start();

    // 이전 탭 아이콘은 축소, 새 탭 아이콘은 확대 + 통통 튀는 효과
    TABS.forEach(tab => {
      const isNewActive = TABS.findIndex(t => t.key === tab.key) === activeIdx;
      const isPrevActive = TABS.findIndex(t => t.key === tab.key) === prevIdx.current;

      if (isNewActive) {
        // 작게 → 크게 튀어나오는 팝 효과
        Animated.sequence([
          Animated.timing(scaleAnims[tab.key], {
            toValue: 0.82,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnims[tab.key], {
            toValue: 1,
            useNativeDriver: true,
            tension: 400,
            friction: 12,
          }),
        ]).start();
      } else if (isPrevActive) {
        Animated.spring(scaleAnims[tab.key], {
          toValue: 0.88,
          useNativeDriver: true,
          tension: 300,
          friction: 20,
        }).start();
      }
    });

    prevIdx.current = activeIdx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const bottomPad = insets.bottom || 0;
  const supported = isLiquidGlassSupported && Platform.OS === 'ios';

  const pillStyle = [
    styles.pill,
    { width: `${pillWidthPct}%` as `${number}%` },
    {
      left: pillLeft.interpolate({
        inputRange: [0, 75],
        outputRange: ['0%', '75%'],
        extrapolate: 'clamp',
      }),
    },
  ];

  const tabButtons = (
    <View style={styles.tabRow}>
      {TABS.map((tab, idx) => {
        const isActive = activeIdx === idx;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onPress(tab.key)}
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
      {supported ? (
        <LiquidGlassContainerView spacing={12} style={styles.barContainer}>
          {/* 메인 탭바 배경 */}
          <LiquidGlassView
            effect="regular"
            colorScheme="light"
            style={styles.bar}
          >
            {tabButtons}
          </LiquidGlassView>

          {/* 선택 pill */}
          <AnimatedLiquidGlassView
            effect="clear"
            colorScheme="light"
            interactive
            style={pillStyle}
          />
        </LiquidGlassContainerView>
      ) : (
        <View style={[styles.barContainer, styles.fallbackBg]}>
          <View style={styles.bar}>
            <AnimatedLiquidGlassView
              effect="none"
              style={[pillStyle, styles.fallbackPill]}
            />
            {tabButtons}
          </View>
        </View>
      )}
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
  barContainer: {
    width: '100%',
    maxWidth: 430,
    borderRadius: BAR_RADIUS,
    position: 'relative',
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    // 바 좌우 내부 패딩 — pill이 바 가장자리에 붙지 않게
    paddingHorizontal: BAR_INNER_PADDING,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    overflow: 'visible',
  },
  tabRow: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
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
