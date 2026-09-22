import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function StickyPromoBanner({ onOpen }) {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.leftContent}>
        <Text style={styles.fireEmoji}>🔥</Text>
        <View style={styles.textBox}>
          <Text style={styles.title}>HARGA SUPER!</Text>
          <Text style={styles.subtitle}>Diskon hingga 50% + Cashback Rp10.000</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.lihatBtn} onPress={onOpen} activeOpacity={0.8}>
        <Text style={styles.lihatText}>Lihat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#075985', // Dark blue floating bar
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  fireEmoji: {
    fontSize: 22,
  },
  textBox: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '600',
  },
  lihatBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lihatText: {
    color: '#075985',
    fontSize: 13,
    fontWeight: '800',
  },
});
