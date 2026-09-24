import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MemberCard from '../components/member/MemberCard';
import PromoBanner from '../components/promo/PromoBanner';
import CategoryGrid from '../components/category/CategoryGrid';
import ProductCard from '../components/product/ProductCard';
import ScrollReveal from '../components/common/ScrollReveal';
import SkeletonGrid, { ProductSkeletonCard } from '../components/common/SkeletonLoader';
import LazyPageTransition from '../components/common/LazyPageTransition';
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
  user,
  onGoToShop,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const numColumns = width >= 1024 ? 5 : width >= 768 ? 3 : 2;
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  const handleCategorySelect = (cat) => {
    setIsCategoryLoading(true);
    if (onSelectCategory) onSelectCategory(cat);
    setTimeout(() => {
      setIsCategoryLoading(false);
    }, 280);
  };

  // Limit Penawaran Terbaik di Beranda maksimal 10 produk
  const displayedProducts = (products || []).slice(0, 10);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (onScrollStateChange) onScrollStateChange(offsetY > 35);
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
      key={`home-grid-${numColumns}`}
      data={displayedProducts}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
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
          {/* Member Floating Points Card (Mobile Only) */}
          {!isDesktop && <MemberCard user={user} />}

          {/* Main Promo Carousel Banner */}
          <PromoBanner />

          {/* Horizontal Icon Category Bar */}
          <CategoryGrid
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />

          {/* Section Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🔥 Penawaran Terbaik</Text>
            <TouchableOpacity onPress={onGoToShop} activeOpacity={0.7}>
              <Text style={styles.productCount}>Lihat Semua ({products ? products.length : 0})</Text>
            </TouchableOpacity>
          </View>
        </>
      }
      renderItem={({ item, index }) => (
        <View style={{ width: `${100 / numColumns}%`, maxWidth: `${100 / numColumns}%` }}>
          <LazyPageTransition isLoading={isCategoryLoading || isPullRefreshing} skeleton={<ProductSkeletonCard />}>
            <ScrollReveal index={index}>
              <ProductCard
                product={item}
                onAddToCart={onAddToCart}
                onUpdateQuantity={onUpdateQuantity}
                cartQuantity={getItemQuantity ? getItemQuantity(item.id) : 0}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectProduct={onSelectProduct}
              />
            </ScrollReveal>
          </LazyPageTransition>
        </View>
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
    paddingBottom: 120,
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
