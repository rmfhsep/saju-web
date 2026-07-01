import React, { useEffect, useRef } from 'react';
import { Animated, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';

export type TabKey = 'recommend' | 'like' | 'message' | 'my';

const LABEL_COLOR = '#1f1f1f';
const ICON_ACTIVE_COLOR = '#1f1f1f';
const ICON_INACTIVE_COLOR = '#8e8e93';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'recommend', label: '추천' },
  { key: 'like', label: '호감' },
  { key: 'message', label: '메시지' },
  { key: 'my', label: '내 정보' },
];

function TabIcon({
  tab,
  active,
  profilePhotoUrl,
}: {
  tab: TabKey;
  active: boolean;
  profilePhotoUrl?: string;
}) {
  const color = active ? ICON_ACTIVE_COLOR : ICON_INACTIVE_COLOR;

  switch (tab) {
    case 'recommend':
      // 집/홈 아이콘 — 추천 피드
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
          <Path
            d="M2 9.5L11 2l9 7.5V20a1 1 0 01-1 1H14v-6H8v6H3a1 1 0 01-1-1V9.5z"
            stroke={color}
            strokeWidth={1.6}
            strokeLinejoin="round"
            fill={active ? color : 'none'}
          />
        </Svg>
      );
    case 'like':
      // 하트 아이콘
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
          <Path
            d="M11 19S3 13.8 3 7.8C3 5 5.2 3 7.8 3c1.3 0 2.5.7 3.2 1.8C11.7 3.7 12.9 3 14.2 3 16.8 3 19 5 19 7.8 19 13.8 11 19 11 19z"
            stroke={color}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'message':
      // 말풍선 아이콘
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
          <Path
            d="M4 4h14a1 1 0 011 1v9a1 1 0 01-1 1H8.5L4 18.5V15a1 1 0 01-1-1V5a1 1 0 011-1z"
            stroke={color}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'my':
      // 피그마: 내 정보 탭은 실제 프로필 사진을 원형으로 보여줌
      if (profilePhotoUrl) {
        return (
          <Image
            source={{ uri: profilePhotoUrl }}
            style={styles.profilePhoto}
          />
        );
      }
      // 프로필 사진 없을 때 기본 사람 아이콘
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
          <Circle cx={11} cy={7.5} r={4} stroke={color} strokeWidth={1.6} />
          <Path
            d="M3 19c0-4 3.6-7 8-7s8 3 8 7"
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </Svg>
      );
  }
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
  const glassAvailable = isGlassEffectAPIAvailable();

  // 선택 pill 좌측 위치 애니메이션
  const pillAnim = useRef(new Animated.Value(0)).current;
  const activeIdx = active ? TABS.findIndex(t => t.key === active) : 0;

  useEffect(() => {
    Animated.spring(pillAnim, {
      toValue: activeIdx,
      useNativeDriver: false,
      tension: 350,
      friction: 28,
    }).start();
  }, [activeIdx, pillAnim]);

  const bottomPad = insets.bottom || 0;

  // 탭 버튼 공통 렌더
  const renderButtons = () =>
    TABS.map(tab => {
      const isActive = active === tab.key;
      return (
        <Pressable
          key={tab.key}
          onPress={() => onPress(tab.key)}
          style={styles.tabButton}
          hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
        >
          <TabIcon tab={tab.key} active={isActive} profilePhotoUrl={profilePhotoUrl} />
          <Text style={[styles.label, isActive && styles.labelActive]}>
            {tab.label}
          </Text>
        </Pressable>
      );
    });

  // 선택 pill: 탭 1개 너비를 25%로 보고, -2px 여유를 줘서 버튼보다 살짝 넓게
  const pillLeft = pillAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['0%', '25%', '50%', '75%'],
  });

  const content = (
    <View style={styles.innerRow}>
      {/* 선택 pill 배경 */}
      {active !== null && (
        <Animated.View style={[styles.selectionPill, { left: pillLeft }]} />
      )}
      {renderButtons()}
    </View>
  );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: bottomPad + 8 }]}
    >
      {glassAvailable && Platform.OS === 'ios' ? (
        // iOS 26+ Liquid Glass 탭바
        <GlassView
          glassEffectStyle="regular"
          colorScheme="light"
          style={styles.bar}
        >
          {content}
        </GlassView>
      ) : (
        // 폴백: 피그마 디자인 그대로 (반투명 흰 pill)
        <View style={[styles.bar, styles.fallbackBg]}>
          {content}
        </View>
      )}
    </View>
  );
}

const BAR_RADIUS = 999;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 16,
  },
  bar: {
    width: '100%',
    maxWidth: 430,
    borderRadius: BAR_RADIUS,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  fallbackBg: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 49,
    paddingHorizontal: 2,
    position: 'relative',
  },
  // 피그마: inset-[0_-2px] → 탭 너비의 25%, 위아래 여백 6px
  selectionPill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    width: '25%',
    backgroundColor: '#efefef',
    borderRadius: BAR_RADIUS,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    zIndex: 1,
    paddingVertical: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    color: ICON_INACTIVE_COLOR,
    lineHeight: 12,
  },
  labelActive: {
    color: LABEL_COLOR,
    fontWeight: '600',
  },
  profilePhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
});
