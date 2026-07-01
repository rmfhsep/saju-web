import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { GlassContainer, GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';

export type TabKey = 'recommend' | 'like' | 'message' | 'my';

const ACTIVE_COLOR = '#1a75ff';
const INACTIVE_COLOR = '#9e9e9e';

function TabIcon({ tab, active }: { tab: TabKey; active: boolean }) {
  const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  switch (tab) {
    case 'recommend':
      return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Path
            d="M10 2.5l2.2 4.46 4.92.72-3.56 3.47.84 4.9L10 13.6l-4.4 2.45.84-4.9L2.88 7.68l4.92-.72L10 2.5z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            fill={active ? color : 'none'}
          />
        </Svg>
      );
    case 'like':
      return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Path
            d="M10 17s-6.5-4-6.5-8.7C3.5 5.5 5.4 4 7.4 4c1 0 2 .5 2.6 1.4C10.6 4.5 11.6 4 12.6 4c2 0 3.9 1.5 3.9 4.3C16.5 13 10 17 10 17z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'message':
      return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Path
            d="M3 4h14a1 1 0 011 1v9a1 1 0 01-1 1H7l-4 3v-3a1 1 0 01-1-1V5a1 1 0 011-1z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'my':
      return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Circle cx={10} cy={6.5} r={3.5} stroke={color} strokeWidth={1.5} />
          <Path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
  }
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'recommend', label: '추천' },
  { key: 'like', label: '호감' },
  { key: 'message', label: '메시지' },
  { key: 'my', label: '내 정보' },
];

// Liquid Glass가 지원되지 않는 기기/버전용 폴백 탭바
function FallbackTabBar({
  active,
  onPress,
  bottomPad,
}: {
  active: TabKey | null;
  onPress: (tab: TabKey) => void;
  bottomPad: number;
}) {
  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPad + 16 }]}>
      <View style={styles.fallbackBar}>
        {TABS.map(tab => {
          const isActive = active === tab.key;
          return (
            <Pressable key={tab.key} onPress={() => onPress(tab.key)} style={styles.tabButton}>
              <TabIcon tab={tab.key} active={isActive} />
              <Text style={[styles.label, { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function LiquidTabBar({
  active,
  onPress,
}: {
  active: TabKey | null;
  onPress: (tab: TabKey) => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom || 0;

  // Liquid Glass API가 없는 기기(iOS 26 미만 등)는 폴백으로 렌더링
  if (!isGlassEffectAPIAvailable()) {
    return <FallbackTabBar active={active} onPress={onPress} bottomPad={bottomPad} />;
  }

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomPad + 16 }]}>
      {/*
       * GlassContainer: 내부 GlassView들이 가까워질 때 서로 합쳐지는(morph) Liquid Glass 그룹.
       * 탭바 전체(bar)와 선택 표시자(pill)를 같은 컨테이너에 두어 iOS 26 모핑 효과를 활성화.
       */}
      <GlassContainer spacing={8} style={styles.glassContainer}>
        {/* 선택된 탭 하이라이트 pill — bar와 같은 GlassContainer 안에서 모핑 */}
        {active !== null && (
          <GlassView
            glassEffectStyle={{ style: 'clear', animate: true, animationDuration: 0.25 }}
            tintColor="rgba(26,117,255,0.15)"
            colorScheme="light"
            style={[
              styles.selectionPill,
              { left: `${TABS.findIndex(t => t.key === active) * 25}%` as any },
            ]}
          />
        )}

        {/* 메인 탭바 — overflow 없이 borderRadius만으로 모양을 잡아 블러가 제대로 렌더링되게 함 */}
        <GlassView
          glassEffectStyle="regular"
          colorScheme="light"
          style={styles.bar}
        >
          {TABS.map(tab => {
            const isActive = active === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onPress(tab.key)}
                style={styles.tabButton}
                android_ripple={{ color: 'rgba(0,0,0,0.05)', borderless: true }}
              >
                <TabIcon tab={tab.key} active={isActive} />
                <Text style={[styles.label, { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </GlassView>
      </GlassContainer>
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
    paddingTop: 16,
  },
  glassContainer: {
    width: '100%',
    maxWidth: 430,
    position: 'relative',
    minHeight: 65,
  },
  // 선택 pill: 탭 1개 너비(25%)를 차지하는 절대 위치 GlassView
  selectionPill: {
    position: 'absolute',
    top: 4,
    width: '25%',
    bottom: 4,
    borderRadius: 100,
    zIndex: 1,
  },
  bar: {
    flexDirection: 'row',
    borderRadius: 296,
    // overflow: 'hidden' 제거 — 이게 있으면 네이티브 블러 렌더링이 막혀 glass 효과가 사라짐
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 12,
    zIndex: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 12,
  },
  // Liquid Glass 미지원 기기용 폴백
  fallbackBar: {
    flexDirection: 'row',
    borderRadius: 296,
    backgroundColor: 'rgba(255,255,255,0.82)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    width: '100%',
    maxWidth: 430,
  },
});
