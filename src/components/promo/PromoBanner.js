import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PROMO_BANNERS } from '../../data/mockProducts';
import { COLORS } from '../../constants/theme';

export default function PromoBanner({ onSeeAllPromo, onSelectPromo }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);

  // Width calculation: 100% of body container
  const layoutWidth = containerWidth || Math.max(300, width - 20);
  const bannerHeight = width >= 1024 ? 340 : isDesktop ? 290 : 230;

  // Auto-slide every 7 seconds
  useEffect(() => {
    if (layoutWidth <= 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % PROMO_BANNERS.length;
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: nextIndex * layoutWidth,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 7000);

    return () => clearInterval(timer);
  }, [layoutWidth]);

  const handleScroll = (event) => {
    if (layoutWidth <= 0) return;
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / layoutWidth);
    if (currentIndex >= 0 && currentIndex < PROMO_BANNERS.length) {
      setActiveIndex(currentIndex);
    }
  };

  const scrollToSlide = (index) => {
    if (index >= 0 && index < PROMO_BANNERS.length) {
      setActiveIndex(index);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: index * layoutWidth,
          animated: true,
        });
      }
    }
  };

  const handlePrev = () => {
    const prev = activeIndex === 0 ? PROMO_BANNERS.length - 1 : activeIndex - 1;
    scrollToSlide(prev);
  };

  const handleNext = () => {
    const next = (activeIndex + 1) % PROMO_BANNERS.length;
    scrollToSlide(next);
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - containerWidth) > 2) {
          setContainerWidth(w);
        }
      }}
    >
      {/* Horizontal Carousel Slider */}
      <View style={styles.sliderWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={layoutWidth}
          decelerationRate="fast"
          contentContainerStyle={styles.scrollContent}
        >
          {PROMO_BANNERS.map((promo) => (
            <TouchableOpacity
              key={promo.id}
              style={[
                styles.bannerCard,
                { width: layoutWidth, height: bannerHeight, backgroundColor: promo.themeColor || '#D91E28' },
              ]}
              onPress={() => onSelectPromo && onSelectPromo(promo)}
              activeOpacity={0.92}
            >
              {/* Background Cover Image */}
              <Image source={{ uri: promo.image }} style={styles.bannerImage} resizeMode="cover" />

              {/* Dark Gradient Overlay for Maximum Legibility & Wow Factor */}
              <View style={[styles.gradientOverlay, { backgroundColor: promo.themeColor ? `${promo.themeColor}CC` : 'rgba(217, 30, 40, 0.85)' }]}>
                {/* Top Badge Tag */}
                <View style={[styles.topBadge, { backgroundColor: promo.badgeBg || COLORS.primaryRed }]}>
                  <Text style={styles.topBadgeText}>{promo.badge}</Text>
                </View>

                {/* Banner Main Text */}
                <View style={styles.mainContent}>
                  <Text style={[styles.promoTitle, isDesktop && styles.desktopTitle]}>
                    {promo.title}
                  </Text>
                  <Text style={[styles.promoHighlight, isDesktop && styles.desktopHighlight]}>
                    {promo.highlight}
                  </Text>
                  <Text style={[styles.promoSubtitle, isDesktop && styles.desktopSubtitle]}>
                    {promo.subtitle}
                  </Text>

                  {/* Period Badge & CTA Button Row */}
                  <View style={styles.actionRow}>
                    <View style={styles.periodBadge}>
                      <Text style={styles.periodText}>{promo.period}</Text>
                    </View>

                    <View style={styles.ctaButton}>
                      <Text style={styles.ctaText}>{promo.ctaText || 'Belanja Sekarang'}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#D91E28" />
                    </View>
                  </View>
                </View>

                {/* Red/Dark Footer Strip */}
                <View style={styles.footerStrip}>
                  <Text style={styles.footerText}>{promo.footerText}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Navigation Side Arrows */}
        {(isDesktop || width >= 600) && (
          <>
            <TouchableOpacity
              style={[styles.arrowBtn, styles.arrowLeft]}
              onPress={handlePrev}
              activeOpacity={0.75}
            >
              <Ionicons name="chevron-back" size={26} color="#D91E28" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.arrowBtn, styles.arrowRight]}
              onPress={handleNext}
              activeOpacity={0.75}
            >
              <Ionicons name="chevron-forward" size={26} color="#D91E28" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Indicator Dots & "Lihat Semua Promo" Row */}
      <View style={styles.indicatorRow}>
        <View style={styles.dotsContainer}>
          {PROMO_BANNERS.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => scrollToSlide(idx)}
              activeOpacity={0.7}
              style={[
                styles.dot,
                idx === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={onSeeAllPromo} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>Lihat Semua Promo ✨</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  sliderWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bannerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    width: '100%',
    height: '100%',
    padding: 16,
    justify: 'space-between',
    backgroundColor: 'rgba(217, 30, 40, 0.85)',
  },
  topBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  topBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mainContent: {
    marginVertical: 'auto',
  },
  promoTitle: {
    color: '#FEF08A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  desktopTitle: {
    fontSize: 16,
    marginBottom: 6,
  },
  promoHighlight: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  desktopHighlight: {
    fontSize: 36,
    lineHeight: 44,
    marginBottom: 10,
  },
  promoSubtitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.95,
    marginBottom: 14,
  },
  desktopSubtitle: {
    fontSize: 16,
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  periodBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  periodText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  ctaText: {
    color: '#D91E28',
    fontSize: 13,
    fontWeight: '900',
  },
  footerStrip: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    marginHorizontal: -16,
    marginBottom: -16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  footerText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  /* Navigation Side Arrows */
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -23,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  arrowLeft: {
    left: 16,
  },
  arrowRight: {
    right: 16,
  },
  /* Indicators */
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginTop: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    width: 26,
    backgroundColor: '#D91E28',
    borderRadius: 5,
  },
  seeAllText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '800',
  },
});
