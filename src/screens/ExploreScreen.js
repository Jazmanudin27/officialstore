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

  // Produk Sering Belanja (Rekomendasi Untuk Kamu)
  const seringBelanjaProducts = [
    {
      id: 'sb1',
      name: 'Aqua Air Mineral Botol 600 ml',
      price: 4000,
      categoryTag: 'Air Mineral',
      weightTag: '600 ml',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80',
    },
    {
      id: 'sb2',
      name: 'Ultra Milk Susu UHT Coklat Kotak 250 ml',
      price: 8400,
      categoryTag: 'Susu Cair',
      weightTag: '250 ml',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
    },
    {
      id: 'sb3',
      name: 'Bimoli Minyak Goreng Pouch 2 L',
      price: 42800,
      categoryTag: 'Minyak Goreng',
      weightTag: '2 L',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    },
    {
      id: 'sb4',
      name: 'Kara Sun Santan Kelapa Cair Siap Pakai 65 ml',
      price: 4700,
      categoryTag: 'Santan',
      weightTag: '65 ml',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80',
    },
  ];

  // List Kategori Produk
  const categories = [
    {
      id: 'c1',
      title: 'Kebutuhan Ibu & Anak',
      bg: '#EFF6FF',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80',
    },
    {
      id: 'c2',
      title: 'Produk Segar & Beku',
      bg: '#ECFDF5',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80',
    },
    {
      id: 'c3',
      title: 'Minuman',
      bg: '#FFF7ED',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80',
    },
    {
      id: 'c4',
      title: 'Kebutuhan Rumah',
      bg: '#F5F3FF',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80',
    },
    {
      id: 'c5',
      title: 'Perawatan Diri',
      bg: '#FDF2F8',
      image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=200&q=80',
    },
    {
      id: 'c6',
      title: 'Makanan Ringan',
      bg: '#FEFCE8',
      image: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=200&q=80',
    },
    {
      id: 'c7',
      title: 'Bumbu Dapur',
      bg: '#FFF1F2',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&q=80',
    },
    {
      id: 'c8',
      title: 'Kesehatan & Obat',
      bg: '#F0FDF4',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&q=80',
    },
  ];

  // Produk Lainnya
  const otherProducts = [
    {
      id: 'op1',
      name: 'Good Day Kopi Instan Cappuccino 10 x 25 g',
      price: 21900,
      categoryTag: 'Kopi Bubuk',
      weightTag: '10 x 25 g',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
    },
    {
      id: 'op2',
      name: 'Tropical Minyak Goreng Kelapa Sawit Botol 2 L',
      price: 43500,
      categoryTag: 'Minyak Goreng',
      weightTag: '2 L',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Red Top Header */}
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
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'rutin' && styles.tabActive]}
          onPress={() => setActiveTab('rutin')}
          activeOpacity={0.7}
        >
          <Ionicons name="receipt-outline" size={16} color={activeTab === 'rutin' ? '#0284C7' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'rutin' && styles.tabTextActive]}>
            Belanja Rutin
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'favorit' && styles.tabActive]}
          onPress={() => setActiveTab('favorit')}
          activeOpacity={0.7}
        >
          <Ionicons name="heart-outline" size={16} color={activeTab === 'favorit' ? '#0284C7' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'favorit' && styles.tabTextActive]}>
            Belanja Favorit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content ScrollView */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* SECTION 1: Rekomendasi Untuk Kamu (Produk Sering Belanja) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Rekomendasi Untuk Kamu</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.lihatSemuaText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Products ScrollView */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {seringBelanjaProducts.map((product) => (
            <View key={product.id} style={styles.productCardHorizontal}>
              <View style={styles.imageBox}>
                <Image source={{ uri: product.image }} style={styles.productImg} />
                <View style={styles.categoryStrip}>
                  <Text style={styles.categoryStripText}>{product.categoryTag}</Text>
                </View>
                {product.weightTag && (
                  <View style={styles.weightTagPill}>
                    <Text style={styles.weightTagText}>{product.weightTag}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>{formatRupiah(product.price)}</Text>

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
        </ScrollView>

        {/* SECTION 2: Belanja Berdasarkan Kategori */}
        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Belanja Berdasarkan Kategori</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.lihatSemuaText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {/* 4-Column Category Grid */}
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryTile, { backgroundColor: cat.bg }]}
              activeOpacity={0.7}
            >
              <Image source={{ uri: cat.image }} style={styles.categoryImg} />
              <Text style={styles.categoryTileTitle} numberOfLines={2}>
                {cat.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SECTION 3: Produk Lainnya Grid */}
        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Produk Lainnya 🛒</Text>
        </View>

        <View style={styles.gridRow}>
          {otherProducts.map((product) => (
            <View key={product.id} style={styles.productCardGrid}>
              <View style={styles.imageBox}>
                <Image source={{ uri: product.image }} style={styles.productImg} />
                <View style={styles.categoryStrip}>
                  <Text style={styles.categoryStripText}>{product.categoryTag}</Text>
                </View>
                {product.weightTag && (
                  <View style={styles.weightTagPill}>
                    <Text style={styles.weightTagText}>{product.weightTag}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>{formatRupiah(product.price)}</Text>

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
  /* Top Tabs */
  tabsContainer: {
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
  /* Content Container */
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 90,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  lihatSemuaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  /* Horizontal Products ScrollView */
  horizontalScroll: {
    gap: 12,
  },
  productCardHorizontal: {
    width: 160,
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
    height: 130,
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
    fontSize: 10,
    fontWeight: '800',
  },
  weightTagPill: {
    position: 'absolute',
    top: 6,
    right: 0,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  weightTagText: {
    color: COLORS.textDark,
    fontSize: 10,
    fontWeight: '800',
  },
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
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
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
  /* 4-Column Category Grid */
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryTile: {
    width: '23%',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginBottom: 6,
    resizeMode: 'cover',
  },
  categoryTileTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 14,
  },
  /* 2-Column Grid */
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  productCardGrid: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
