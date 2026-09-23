import React, { useEffect, useRef } from 'react';
import { Animated, Platform } from 'react-native';

export default function ScrollReveal({ children, index = 0, delay = 0, style }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const hasAnimatedRef = useRef(false);
  const elementRef = useRef(null);

  const startAnimation = () => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const calculatedDelay = delay + (index % 8) * 60;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 360,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 75,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 75,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }, calculatedDelay);
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      let observer;
      const fallbackTimer = setTimeout(() => {
        startAnimation();
      }, 500);

      try {
        const targetElement = elementRef.current;
        if (targetElement) {
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  clearTimeout(fallbackTimer);
                  startAnimation();
                  if (observer) observer.disconnect();
                }
              });
            },
            { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
          );

          if (targetElement instanceof HTMLElement) {
            observer.observe(targetElement);
          } else {
            startAnimation();
          }
        } else {
          startAnimation();
        }
      } catch (e) {
        startAnimation();
      }

      return () => {
        clearTimeout(fallbackTimer);
        if (observer) observer.disconnect();
      };
    } else {
      startAnimation();
    }
  }, [index, delay]);

  return (
    <Animated.View
      ref={elementRef}
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
