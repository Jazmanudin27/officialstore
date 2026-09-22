import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import MemberCard from '../components/member/MemberCard';
import PromoBanner from '../components/promo/PromoBanner';
import CategoryGrid from '../components/category/CategoryGrid';
import ProductCard from '../components/product/ProductCard';
import { COLORS } from '../constants/theme';

export default function HomeScreen({
  products,
  onAddToCart,
  onUpdateQuantity,
  getItemQuantity,
  isFavorite,
  onToggleFavorite,
  onSelectCategory,
  selectedCategory,
  onScrollStateChange,
  onRefresh,
  refreshing = false,
  onSelectProduct,
}) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    onScrollStateChange(offsetY > 35);
  };

  const handlePullDownRefresh = async () => {
    setInternalRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => {
      setInternalRefreshing(false);
    }, 800);
  };

  const isPullRefreshing = refreshing || internalRefreshing;

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={isPullRefreshing}
          onRefresh={handlePullDownRefresh}
          colors={['#D91E28', '#0284C7']}
          tintColor="#D91E28"
          title="Memuat data terbaru..."
          titleColor="#64748B"
        />
      }
      ListHeaderComponent={
        <>
          {/* Member Floating Points Card */}
          <MemberCard />

          {/* Main Promo Carousel Banner */}
          <PromoBanner />

          {/* Horizontal Icon Category Bar */}
          <CategoryGrid
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
          />

          {/* Section Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🔥 Penawaran Terbaik</Text>
            <Text style={styles.productCount}>Lihat Semua</Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onAddToCart={onAddToCart}
          onUpdateQuantity={onUpdateQuantity}
          cartQuantity={getItemQuantity ? getItemQuantity(item.id) : 0}
          isFavorite={isFavorite(item.id)}
          onToggleFavorite={onToggleFavorite}
          onSelectProduct={onSelectProduct}
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
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 18,
    fontWeight: '800',
  },
  productCount: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '800',
  },
});
