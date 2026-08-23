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
        return (
          <Svg width={22} height={22} viewBox="0 0 20.5 20.5" fill="none">
            <Path
              d="M0.75 7.5225C0.75 7.13258 0.948461 6.76678 1.2826 6.54081L9.51594 0.972904C9.95542 0.675698 10.5446 0.675699 10.9841 0.972904L19.2174 6.54081C19.5515 6.76678 19.75 7.13258 19.75 7.5225V17.9431C19.75 18.941 18.8993 19.75 17.85 19.75H2.65C1.60066 19.75 0.75 18.941 0.75 17.9431V7.5225Z"
              fill={active ? STROKE : 'none'} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
            />
            <Path d="M5.5 15.5938H15" stroke={active ? '#efefef' : STROKE} strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
        );
      case 'like':
        return (
          <Svg width={23} height={20.1} viewBox="0 0 22.5 19.5986" fill="none">
            <Path
              d="M16.0227 0.75C14.5254 0.75 13.1612 1.34357 12.149 2.34069C11.6782 2.80443 10.8218 2.80443 10.351 2.34069C9.33879 1.34357 7.97461 0.75 6.47727 0.75C3.32727 0.75 0.75 3.48553 0.75 6.82895C0.75 12.1202 8.83954 17.4896 10.8175 18.7234C11.0844 18.8898 11.4161 18.8903 11.6834 18.7248C13.6631 17.4987 21.75 12.1638 21.75 6.82895C21.75 3.48553 19.1727 0.75 16.0227 0.75Z"
              fill={active ? STROKE : 'none'} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
            />
          </Svg>
        );
      case 'message':
        return (
          <Svg width={21.5} height={22} viewBox="0 0 21.4981 21.5" fill="none">
            <Path
              d="M19.9926 14.57C20.4795 13.3931 20.7481 12.1029 20.7481 10.75C20.7481 5.22715 16.2714 0.75 10.7491 0.75C5.22673 0.75 0.75 5.22715 0.75 10.75C0.75 16.2728 5.22673 20.75 10.7491 20.75C12.4087 20.75 13.974 20.3456 15.3516 19.63C15.5406 19.5318 15.7584 19.501 15.9649 19.5527L19.5477 20.4484C20.1218 20.592 20.6584 20.108 20.5747 19.5222L19.9325 15.0259C19.9104 14.8714 19.933 14.7142 19.9926 14.57Z"
              fill={active ? STROKE : 'none'} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
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
        <View style={[styles.barContainer, styles.fallbackBg]}>
          <View style={styles.bar}>
            <Animated.View style={[pillAnimStyle, styles.fallbackPill]} />
            {tabButtons}
          </View>
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
  fallbackBg: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  fallbackPill: {
    backgroundColor: '#efefef',
  },
});
