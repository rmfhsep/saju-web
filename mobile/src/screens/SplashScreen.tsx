import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Image } from 'react-native';

interface Props {
  onFinish: () => void;
}

// 디자인 시안(assets/Splash.png)을 전체 화면으로 노출
export default function SplashScreen({ onFinish }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(onFinish, 700);
    });
  }, [onFinish, opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Image
        source={require('../../assets/Splash.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
