import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import MemberCard from '../components/member/MemberCard';
import PromoBanner from '../components/promo/PromoBanner';
import CategoryGrid from '../components/category/CategoryGrid';
import ProductCard from '../components/product/ProductCard';
import { COLORS } from '../constants/theme';

export default function HomeScreen({ products, onAddToCart, isFavorite, onToggleFavorite, onSelectCategory }) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      style={styles.container}
      ListHeaderComponent={
        <>
          {/* Member Floating Points Card */}
          <MemberCard />

          {/* Main Promo Carousel Banner */}
          <PromoBanner />

          {/* 2-Row Icon Category Grid */}
          <CategoryGrid onSelectCategory={onSelectCategory} />

          {/* Section Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🔥 Rekomendasi Spesial Untukmu</Text>
            <Text style={styles.productCount}>{products.length} Produk</Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onAddToCart={onAddToCart}
          isFavorite={isFavorite(item.id)}
          onToggleFavorite={onToggleFavorite}
        />
      )}
      contentContainerStyle={styles.productListContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  productListContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  productCount: {
    color: COLORS.primaryRed,
    fontSize: 12,
    fontWeight: '700',
  },
});
