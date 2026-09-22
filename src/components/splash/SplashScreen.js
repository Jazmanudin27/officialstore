import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const screenFadeAnim = useRef(new Animated.Value(1)).current;

  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    // Entrance Animation (Fade-in + Scale)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous Pulse Effect for Logo Ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress Bar Animation (0% to 100% in 2.2 seconds)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start();

    // Listener for progress percent text
    const listenerId = progressAnim.addListener(({ value }) => {
      setProgressPercent(Math.floor(value * 100));
    });

    // Auto finish timer (Exit Fade out after 2.6s)
    const timer = setTimeout(() => {
      handleExit();
    }, 2500);

    return () => {
      progressAnim.removeListener(listenerId);
      clearTimeout(timer);
    };
  }, []);

  const handleExit = () => {
    Animated.timing(screenFadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.fullScreen, { opacity: screenFadeAnim }]}>
      <LinearGradient
        colors={['#800A0F', '#B91C1C', '#D91E28', '#EF4444', '#991B1B']}
        locations={[0, 0.25, 0.55, 0.8, 1]}
        style={styles.gradientBg}
      >
        {/* Decorative Background Circles */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <SafeAreaView style={styles.contentContainer}>
          {/* Main Logo & Title Container */}
          <Animated.View
            style={[
              styles.centerBox,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Pulsing Glowing Ring */}
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />

            {/* 3D App Logo Image Container */}
            <View style={styles.logoCard}>
              <Image
                source={require('../../../assets/splash-logo.jpg')}
                style={styles.logoImg}
                resizeMode="cover"
              />
            </View>

            {/* Title Row with Gold Badge */}
            <View style={styles.titleRow}>
              <Text style={styles.titleMain}>OFFICIAL STORE</Text>
              <View style={styles.goldBadge}>
                <Ionicons name="sparkles" size={10} color="#78350F" />
                <Text style={styles.goldBadgeText}>PROMO</Text>
              </View>
            </View>

            <Text style={styles.tagline}>
              Belanja Kebutuhan Harian Mudah & Cepat
            </Text>

            {/* Feature Pills Row */}
            <View style={styles.featureRow}>
              <View style={styles.featurePill}>
                <Ionicons name="flash" size={12} color="#FEF08A" />
                <Text style={styles.featurePillText}>Instan 30 Mnt</Text>
              </View>

              <View style={styles.featurePill}>
                <Ionicons name="shield-checkmark" size={12} color="#FEF08A" />
                <Text style={styles.featurePillText}>100% Original</Text>
              </View>

              <View style={styles.featurePill}>
                <Ionicons name="pricetag" size={12} color="#FEF08A" />
                <Text style={styles.featurePillText}>Harga Super</Text>
              </View>
            </View>
          </Animated.View>

          {/* Bottom Loading Progress Container */}
          <View style={styles.bottomSection}>
            <View style={styles.loadingInfoRow}>
              <Text style={styles.loadingText}>Memuat produk & promo terbaru...</Text>
              <Text style={styles.percentText}>{progressPercent}%</Text>
            </View>

            {/* Progress Bar Track */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressWidth,
                  },
                ]}
              />
            </View>

            {/* Footer App Info */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Official Store v1.0.0</Text>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerText}>Alfagift Inspired UI</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  gradientBg: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  centerBox: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  pulseRing: {
    position: 'absolute',
    top: -15,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  logoCard: {
    width: 140,
    height: 140,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  titleMain: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1.5,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  goldBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#78350F',
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  featurePillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    width: '100%',
    maxWidth: 320,
    gap: 8,
    marginBottom: 20,
  },
  loadingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '500',
  },
  percentText: {
    color: '#FEF08A',
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FEF08A',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
  },
  footerDot: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
  },
});
