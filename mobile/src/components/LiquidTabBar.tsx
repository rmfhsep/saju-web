import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { GlassContainer, GlassView } from 'expo-glass-effect';

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

export default function LiquidTabBar({
  active,
  onPress,
}: {
  active: TabKey | null;
  onPress: (tab: TabKey) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: insets.bottom || 12 }]}>
      <GlassContainer spacing={4} style={styles.container}>
        <GlassView glassEffectStyle="regular" style={styles.bar}>
          {TABS.map(tab => {
            const isActive = active === tab.key;
            return (
              <Pressable key={tab.key} onPress={() => onPress(tab.key)} style={styles.tabButton}>
                {isActive && (
                  <GlassView
                    glassEffectStyle={{ style: 'clear', animate: true }}
                    tintColor="rgba(26,117,255,0.12)"
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <TabIcon tab={tab.key} active={isActive} />
                <Text style={[styles.label, { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }]}>{tab.label}</Text>
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
  container: {
    width: '100%',
    maxWidth: 430,
  },
  bar: {
    flexDirection: 'row',
    borderRadius: 296,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 10,
    borderRadius: 100,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 12,
  },
});
