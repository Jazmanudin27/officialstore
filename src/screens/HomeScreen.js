import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MemberCard from '../components/member/MemberCard';
import PromoBanner from '../components/promo/PromoBanner';
import CategoryGrid from '../components/category/CategoryGrid';
import ProductCard from '../components/product/ProductCard';
import ScrollReveal from '../components/common/ScrollReveal';
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
  openPpob,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const numColumns = width >= 1024 ? 5 : width >= 768 ? 3 : 2;
  const [internalRefreshing, setInternalRefreshing] = useState(false);

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

          {/* DigiFlazz PPOB & Pulsa Banner Widget */}
          <TouchableOpacity
            style={styles.ppobWidgetBanner}
            onPress={openPpob}
            activeOpacity={0.85}
          >
            <View style={styles.ppobWidgetLeft}>
              <View style={styles.ppobWidgetIconWrap}>
                <Ionicons name="flash" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ppobWidgetTitle}>⚡ DigiFlazz Pulsa & PPOB 24 Jam</Text>
                <Text style={styles.ppobWidgetSub} numberOfLines={1}>
                  Pulsa, Data, PLN, BPJS, PDAM, Game & E-Wallet
                </Text>
              </View>
            </View>
            <View style={styles.ppobWidgetBtn}>
              <Text style={styles.ppobWidgetBtnText}>Buka Layanan</Text>
              <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Horizontal Icon Category Bar */}
          <CategoryGrid
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
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
  ppobWidgetBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  ppobWidgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  ppobWidgetIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D91E28',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ppobWidgetTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  ppobWidgetSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  ppobWidgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D91E28',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
    marginLeft: 8,
  },
  ppobWidgetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
