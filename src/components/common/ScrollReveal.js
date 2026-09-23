import React, { useEffect, useRef } from 'react';
import { Animated, Platform, View } from 'react-native';

export default function ScrollReveal({ children, index = 0, delay = 0, style }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'web') return; // Ensure web content is always 100% visible immediately

    fadeAnim.setValue(0.3);
    slideAnim.setValue(18);

    const calculatedDelay = Math.min(delay + (index % 6) * 45, 250);
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, calculatedDelay);
  }, [index, delay]);

  if (Platform.OS === 'web') {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
