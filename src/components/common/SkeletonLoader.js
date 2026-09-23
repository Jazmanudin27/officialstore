import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';

export function ProductSkeletonCard() {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.cardPlaceholder, { opacity: pulseAnim }]}>
      {/* Image Box Skeleton */}
      <View style={styles.imagePlaceholder} />
      
      {/* Content Lines Skeleton */}
      <View style={styles.contentPlaceholder}>
        <View style={styles.titleLineLong} />
        <View style={styles.titleLineShort} />
        <View style={styles.priceTagLine} />
        <View style={styles.buttonPlaceholder} />
      </View>
    </Animated.View>
  );
}

export default function SkeletonGrid({ count = 8 }) {
  const { width } = useWindowDimensions();
  const numColumns = width >= 1024 ? 5 : width >= 768 ? 3 : 2;
  const itemWidthPercent = `${100 / numColumns}%`;

  const dummyArray = Array.from({ length: count });

  return (
    <View style={styles.gridRow}>
      {dummyArray.map((_, idx) => (
        <View key={idx} style={[styles.gridItemWrapper, { width: itemWidthPercent }]}>
          <ProductSkeletonCard />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  gridItemWrapper: {
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  cardPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#CBD5E1',
    borderRadius: 12,
  },
  contentPlaceholder: {
    marginTop: 10,
    gap: 8,
  },
  titleLineLong: {
    width: '90%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
  titleLineShort: {
    width: '60%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
  priceTagLine: {
    width: '50%',
    height: 18,
    backgroundColor: '#CBD5E1',
    borderRadius: 6,
    marginTop: 4,
  },
  buttonPlaceholder: {
    width: '100%',
    height: 36,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    marginTop: 6,
  },
});
