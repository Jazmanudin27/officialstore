import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { PRODUCTS } from '../data/mockProducts';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';

export default function ExploreScreen({ onAddToCart }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.explorePadding}>
      <Text style={styles.title}>🔍 Eksplor Kategori Resmi</Text>
      <View style={styles.exploreGrid}>
        {PRODUCTS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.exploreCard}
            onPress={() => onAddToCart(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.exploreName}>{item.name}</Text>
            <Text style={styles.explorePrice}>{formatRupiah(item.price)}</Text>
            <View style={styles.exploreTag}>
              <Text style={styles.exploreTagText}>Garansi Resmi</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  explorePadding: {
    paddingBottom: 30,
  },
  exploreGrid: {
    gap: 12,
  },
  exploreCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exploreName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  explorePrice: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  exploreTag: {
    backgroundColor: COLORS.accentMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  exploreTagText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
});
