import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { PROMO_BANNERS } from '../../data/mockProducts';
import { COLORS } from '../../constants/theme';

export default function PromoBanner() {
  const promo = PROMO_BANNERS[0];

  return (
    <View style={styles.container}>
      {/* Banner Card */}
      <View style={styles.bannerCard}>
        <Image source={{ uri: promo.image }} style={styles.bannerImage} resizeMode="cover" />
        
        {/* Overlay Banner Text */}
        <View style={styles.bannerContent}>
          <Text style={styles.promoTag}>HOMECARE FAIR</Text>
          <Text style={styles.promoHighlight}>CASHBACK 10.000</Text>
          <Text style={styles.promoSub}>Produk Home Care</Text>
          <View style={styles.periodBadge}>
            <Text style={styles.periodText}>{promo.period}</Text>
          </View>
        </View>

        {/* Red Bottom Strip */}
        <View style={styles.redStrip}>
          <Text style={styles.redStripText}>
            🎁 VOUCHER GAK ABIS-ABIS • 🚚 BEBAS ONGKIR • 🌟 A-POIN NAMBAH TERUS
          </Text>
        </View>
      </View>

      {/* Indicator Dots & "Lihat Semua Promo" Row */}
      <View style={styles.indicatorRow}>
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
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
    paddingHorizontal: 10,
    marginBottom: 16,
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
    marginTop: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    width: 16,
    backgroundColor: '#0284C7',
  },
  seeAllText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '800',
  },
});
