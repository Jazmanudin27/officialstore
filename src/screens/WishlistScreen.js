import React from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/product/ProductCard';
import ScrollReveal from '../components/common/ScrollReveal';
import { PRODUCTS } from '../data/mockProducts';
import { COLORS } from '../constants/theme';

export default function WishlistScreen({ favorites, onAddToCart, isFavorite, onToggleFavorite, onSelectProduct }) {
  const { width } = useWindowDimensions();
  const numColumns = width >= 1024 ? 5 : width >= 768 ? 3 : 2;
  const favProducts = PRODUCTS.filter((p) => favorites.includes(p.id));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>❤️ Produk Favorit Saya ({favProducts.length})</Text>
      {favProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-dislike-outline" size={56} color={COLORS.border} />
          <Text style={styles.emptyTitle}>Belum ada produk favorit</Text>
          <Text style={styles.emptySub}>Klik ikon hati pada produk untuk menyimpannya di sini.</Text>
        </View>
      ) : (
        <FlatList
          key={`wishlist-grid-${numColumns}`}
          data={favProducts}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={({ item, index }) => (
            <View style={{ width: `${100 / numColumns}%`, maxWidth: `${100 / numColumns}%` }}>
              <ScrollReveal index={index}>
                <ProductCard
                  product={item}
                  onAddToCart={onAddToCart}
                  isFavorite={isFavorite(item.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectProduct={onSelectProduct}
                />
              </ScrollReveal>
            </View>
          )}
          contentContainerStyle={styles.productListContent}
        />
      )}
    </View>
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
  productListContent: {
    paddingBottom: 130,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
