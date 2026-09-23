import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { PROMO_BANNERS } from '../../data/mockProducts';
import { COLORS } from '../../constants/theme';

export default function PromoBanner() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(300, (width || 360) - 20);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);

  // Auto-slide every 15 seconds (15000 ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % PROMO_BANNERS.length;
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: nextIndex * cardWidth,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / cardWidth);
    setActiveIndex(currentIndex);
  };

  return (
    <View style={styles.container}>
      {/* Horizontal Carousel Slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={cardWidth}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {PROMO_BANNERS.map((promo) => (
          <View key={promo.id} style={[styles.bannerCard, { width: cardWidth - 8 }]}>
            <Image source={{ uri: promo.image }} style={styles.bannerImage} resizeMode="cover" />
            
            {/* Overlay Banner Text */}
            <View style={styles.bannerContent}>
              <Text style={styles.promoTag}>{promo.title}</Text>
              <Text style={styles.promoHighlight}>{promo.highlight}</Text>
              <Text style={styles.promoSub}>{promo.subtitle}</Text>
              <View style={styles.periodBadge}>
                <Text style={styles.periodText}>{promo.period}</Text>
              </View>
            </View>

            {/* Red Bottom Strip */}
            <View style={styles.redStrip}>
              <Text style={styles.redStripText}>{promo.footerText}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Indicator Dots & "Lihat Semua Promo" Row */}
      <View style={styles.indicatorRow}>
        <View style={styles.dotsContainer}>
          {PROMO_BANNERS.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAllText}>Lihat Semua Promo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 10,
    gap: 8,
  },
  bannerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 160,
    position: 'relative',
    backgroundColor: '#0284C7',
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerContent: {
    padding: 14,
    backgroundColor: 'rgba(2, 132, 199, 0.45)',
    flex: 1,
    justifyContent: 'center',
  },
  promoTag: {
    color: '#FEF08A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  promoHighlight: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 2,
  },
  promoSub: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  periodBadge: {
    backgroundColor: COLORS.primaryRed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  periodText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  redStrip: {
    backgroundColor: COLORS.primaryRed,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  redStripText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    width: 20,
    backgroundColor: '#0284C7',
    borderRadius: 4,
  },
  seeAllText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '800',
  },
});
