import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';

export default function ExploreScreen({ onAddToCart, openSearch, openCart, cartCount = 0 }) {
  const [activeTab, setActiveTab] = useState('rutin');

  // Frequent / Recommended Routine Products
  const routineProducts = [
    {
      id: 'r1',
      name: 'Aqua Air Mineral Botol 600 ml',
      price: 4000,
      originalPrice: 4500,
      categoryTag: 'Air Mineral',
      weightTag: '600 ml',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80',
    },
    {
      id: 'r2',
      name: 'Ultra Milk Susu UHT Coklat Kotak 250 ml',
      price: 8400,
      originalPrice: 9000,
      categoryTag: 'Susu Cair',
      weightTag: '250 ml',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
    },
    {
      id: 'r3',
      name: 'Bimoli Minyak Goreng Pouch 2 L',
      price: 42800,
      originalPrice: 45000,
      categoryTag: 'Minyak Goreng',
      weightTag: '2 L',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    },
    {
      id: 'r4',
      name: 'Good Day Kopi Instan Cappuccino 10 x 25 g',
      price: 21900,
      originalPrice: 25300,
      categoryTag: 'Kopi Bubuk',
      weightTag: '10 x 25 g',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
    },
  ];

  // Category list matching Alfagift UI
  const categories = [
    { id: 'c1', name: 'Kebutuhan Ibu & Anak', icon: 'baby-carriage', color: '#EFF6FF', iconColor: '#0284C7' },
    { id: 'c2', name: 'Produk Segar & Beku', icon: 'nutrition', color: '#F0FDF4', iconColor: '#16A34A' },
    { id: 'c3', name: 'Minuman', icon: 'wine', color: '#FFF7ED', iconColor: '#EA580C' },
    { id: 'c4', name: 'Kebutuhan Rumah', icon: 'home', color: '#FEF2F2', iconColor: '#DC2626' },
    { id: 'c5', name: 'Perawatan Diri', icon: 'sparkles', color: '#FDF4FF', iconColor: '#C084FC' },
    { id: 'c6', name: 'Makanan Ringan', icon: 'fast-food', color: '#FEFCE8', iconColor: '#CA8A04' },
    { id: 'c7', name: 'Bumbu Dapur', icon: 'restaurant', color: '#ECFDF5', iconColor: '#059669' },
    { id: 'c8', name: 'Kesehatan & Obat', icon: 'medkit', color: '#F0F9FF', iconColor: '#0284C7' },
  ];

  // Other products for lower grid
  const otherProducts = [
    {
      id: 'o1',
      name: 'Sania Minyak Goreng Pouch 2 L',
      price: 41900,
      originalPrice: 42800,
      discount: '2%',
      categoryTag: 'Minyak Goreng',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    },
    {
      id: 'o2',
      name: 'Tropical Minyak Goreng Sawit Botol 2 L',
      price: 43500,
      originalPrice: 47100,
      discount: '8%',
      categoryTag: 'Minyak Goreng',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    },
    {
      id: 'o3',
      name: 'Kara Sun Santan Kelapa Cair Siap Pakai 65 ml',
      price: 4700,
      originalPrice: 5700,
      discount: '18%',
      categoryTag: 'Santan',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80',
    },
    {
      id: 'o4',
      name: 'Vit Air Mineral Botol 550 ml',
      price: 3200,
      originalPrice: 3600,
      discount: '11%',
      categoryTag: 'Air Mineral',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Solid Red Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Belanja</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={openSearch} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity onPress={openCart} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="bag-handle-outline" size={22} color={COLORS.white} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount || 3}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Tabs: Belanja Rutin vs Belanja Favorit */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'rutin' && styles.tabActive]}
          onPress={() => setActiveTab('rutin')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="clipboard-outline"
            size={18}
            color={activeTab === 'rutin' ? '#0284C7' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'rutin' && styles.tabTextActive]}>
            Belanja Rutin
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'favorit' && styles.tabActive]}
          onPress={() => setActiveTab('favorit')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="heart-outline"
            size={18}
            color={activeTab === 'favorit' ? '#0284C7' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'favorit' && styles.tabTextActive]}>
            Belanja Favorit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Rekomendasi Untuk Kamu (Routine / Frequent Items Carousel) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Rekomendasi Untuk Kamu</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.lihatSemuaText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routineScroll}>
          {routineProducts.map((item) => (
            <View key={item.id} style={styles.routineCard}>
              <View style={styles.imageBox}>
                <Image source={{ uri: item.image }} style={styles.productImg} />
                <View style={styles.categoryStrip}>
                  <Text style={styles.categoryStripText}>{item.categoryTag}</Text>
                </View>
                {item.weightTag && (
                  <View style={styles.weightTagPill}>
                    <Text style={styles.weightTagText}>{item.weightTag}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>{formatRupiah(item.price)}</Text>

                <View style={styles.deliveryRow}>
                  <Ionicons name="flash" size={12} color="#D91E28" />
                  <Text style={styles.deliveryText}>{item.delivery}</Text>
                </View>

                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => onAddToCart && onAddToCart(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addToCartBtnText}>+ Keranjang</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Section 2: Belanja Berdasarkan Kategori */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <Text style={styles.sectionTitle}>Belanja Berdasarkan Kategori</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.lihatSemuaText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard} activeOpacity={0.7}>
              <View style={[styles.categoryIconCircle, { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icon} size={24} color={cat.iconColor} />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 3: Produk Lainnya (Grid Layout) */}
        <Text style={[styles.sectionTitle, { marginTop: 16, marginBottom: 8 }]}>
          Produk Lainnya
        </Text>

        <View style={styles.gridRow}>
          {otherProducts.map((product) => (
            <View key={product.id} style={styles.productGridCard}>
              <View style={styles.imageBoxGrid}>
                <Image source={{ uri: product.image }} style={styles.productImg} />
                <View style={styles.categoryStrip}>
                  <Text style={styles.categoryStripText}>{product.categoryTag}</Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>{formatRupiah(product.price)}</Text>

                <View style={styles.discountRow}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{product.discount}</Text>
                  </View>
                  <Text style={styles.originalPrice}>{formatRupiah(product.originalPrice)}</Text>
                </View>

                <View style={styles.deliveryRow}>
                  <Ionicons name="flash" size={12} color="#D91E28" />
                  <Text style={styles.deliveryText}>{product.delivery}</Text>
                </View>

                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => onAddToCart && onAddToCart(product)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addToCartBtnText}>+ Keranjang</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#D91E28',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#FEF08A',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: COLORS.textDark,
    fontSize: 10,
    fontWeight: '800',
  },
  /* Tabs Row */
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0284C7',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  /* Container Scroll */
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 90,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  lihatSemuaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  /* Routine Products Carousel */
  routineScroll: {
    gap: 12,
  },
  routineCard: {
    width: 170,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  imageBox: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imageBoxGrid: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImg: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  categoryStrip: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    backgroundColor: '#D91E28',
    borderRadius: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  categoryStripText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
  weightTagPill: {
    position: 'absolute',
    top: 8,
    right: 0,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  weightTagText: {
    color: COLORS.textDark,
    fontSize: 9,
    fontWeight: '800',
  },
  /* Card Body */
  cardInfo: {
    padding: 10,
    gap: 4,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    minHeight: 34,
    lineHeight: 17,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discountBadge: {
    backgroundColor: '#D91E28',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 4,
  },
  deliveryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D91E28',
  },
  addToCartBtn: {
    backgroundColor: '#005691',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  addToCartBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  /* Category Grid */
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 15,
  },
  /* Lower Product Grid */
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  productGridCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
});
