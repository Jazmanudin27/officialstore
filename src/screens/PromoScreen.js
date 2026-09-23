import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';
import PromoBanner from '../components/promo/PromoBanner';

export default function PromoScreen({ onAddToCart, openSearch, openCart, cartCount = 0, onSelectProduct }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const numColumns = width >= 1200 ? 5 : width >= 992 ? 4 : width >= 768 ? 3 : 2;

  const [activePromoTab, setActivePromoTab] = useState('harga_spesial');

  // Products Data for "Harga Spesial"
  const hargaSpesialProducts = [
    {
      id: 'hs1',
      name: 'Good Day Kopi Instan Cappuccino 10 x 25 g',
      price: 21900,
      originalPrice: 25300,
      discount: '13%',
      categoryTag: 'Kopi Bubuk',
      weightTag: '10 x 25 g',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
    },
    {
      id: 'hs2',
      name: 'Kara Sun Santan Kelapa Cair Siap Pakai 65 ml',
      price: 4700,
      originalPrice: 5700,
      discount: '18%',
      categoryTag: 'Santan',
      weightTag: '65 ml',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80',
    },
    {
      id: 'hs3',
      name: 'Sania Minyak Goreng Pouch 2 L',
      price: 41900,
      originalPrice: 42800,
      discount: '2%',
      categoryTag: 'Minyak Goreng',
      weightTag: '2 L',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    },
    {
      id: 'hs4',
      name: 'Tropical Minyak Goreng Kelapa Sawit Botol 2 L',
      price: 43500,
      originalPrice: 47100,
      discount: '8%',
      categoryTag: 'Minyak Goreng',
      weightTag: '2 L',
      delivery: 'Pengiriman Instan',
      specialBadge: 'MURAH BANGET',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    },
    {
      id: 'hs5',
      name: 'Bumbu Tabur Balado Spesial Official 250 g',
      price: 15500,
      originalPrice: 19500,
      discount: '20%',
      categoryTag: 'Bumbu Tabur',
      weightTag: '250 g',
      delivery: 'Pengiriman Instan',
      specialBadge: 'TERLARIS',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    },
    {
      id: 'hs6',
      name: 'Cabai Bubuk Super Pedas Level 15 Botol 100 g',
      price: 12500,
      originalPrice: 16000,
      discount: '22%',
      categoryTag: 'Cabai Olahan',
      weightTag: '100 g',
      delivery: 'Pengiriman Instan',
      image: 'https://images.unsplash.com/photo-1588870995846-f4ffbc3d8144?w=400&q=80',
    },
  ];

  // Products Data for "Gratis Produk"
  const gratisProducts = [
    {
      id: 'gp1',
      name: 'Vit Air Mineral Botol 550 ml',
      price: 3200,
      originalPrice: 3600,
      discount: '11%',
      categoryTag: 'Air Mineral',
      weightTag: '550 ml',
      delivery: 'Pengiriman Instan',
      gratisBadge: true,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80',
    },
    {
      id: 'gp2',
      name: 'Listerine Obat Kumur Antiseptik Cool Mint 250 ml',
      price: 21900,
      originalPrice: 27400,
      discount: '20%',
      categoryTag: 'Obat Kumur',
      weightTag: '250 ml',
      delivery: 'Pengiriman Instan',
      gratisBadge: true,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
    },
    {
      id: 'gp3',
      name: 'Charm Cooling Fresh Pembalut Wanita Wing 23 cm',
      price: 15900,
      originalPrice: 18500,
      discount: '14%',
      categoryTag: 'Pembalut',
      weightTag: '15 pcs',
      delivery: 'Pengiriman Instan',
      gratisBadge: true,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    },
    {
      id: 'gp4',
      name: 'Nestle Koko Krunch Sereal Cup 30 g',
      price: 9000,
      originalPrice: 11000,
      discount: '18%',
      categoryTag: 'Sereal',
      weightTag: '30 g',
      delivery: 'Pengiriman Instan',
      gratisBadge: true,
      image: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80',
    },
  ];

  // Products Data for "Paket"
  const paketProducts = [
    {
      id: 'pk1',
      name: 'Paket Tresemme Keratin Smooth Spray & Serum',
      price: 200000,
      originalPrice: 310000,
      discount: '35%',
      categoryTag: 'Produk Online',
      delivery: 'Pengiriman 1-3 Hari',
      image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&q=80',
    },
    {
      id: 'pk2',
      name: 'Paket Head & Shoulders Sampo Antiketombe 2x',
      price: 185000,
      originalPrice: 285000,
      discount: '35%',
      categoryTag: 'Produk Online',
      delivery: 'Pengiriman 1-3 Hari',
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80',
    },
    {
      id: 'pk3',
      name: 'Paket Head & Shoulders Sampo Lemon Fresh 2x',
      price: 185000,
      originalPrice: 285000,
      discount: '35%',
      categoryTag: 'Produk Online',
      delivery: 'Pengiriman 1-3 Hari',
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80',
    },
    {
      id: 'pk4',
      name: 'Paket Tresemme Keratin Smooth - Shampoo + Conditioner',
      price: 178800,
      originalPrice: 274000,
      discount: '35%',
      categoryTag: 'Produk Online',
      delivery: 'Pengiriman 1-3 Hari',
      image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&q=80',
    },
  ];

  const getActiveProducts = () => {
    switch (activePromoTab) {
      case 'gratis_produk':
        return gratisProducts;
      case 'paket':
        return paketProducts;
      case 'harga_spesial':
      default:
        return hargaSpesialProducts;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Red Header Bar (Mobile Only) */}
      {!isDesktop && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Promo Toko</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={openSearch} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="search-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity onPress={openCart} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="bag-handle-outline" size={22} color={COLORS.white} />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount || 0}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Desktop Header Title Banner */}
        {isDesktop && (
          <View style={styles.desktopBannerHeader}>
            <View style={styles.desktopBannerTitleRow}>
              <Ionicons name="sparkles" size={28} color="#F59E0B" />
              <Text style={styles.desktopBannerTitle}>Pusat Promo & Diskon Spesial</Text>
            </View>
            <Text style={styles.desktopBannerSubtitle}>
              Hemat hingga 50% untuk bumbu, kebutuhan dapur, dan belanja harian di Official Store.
            </Text>
          </View>
        )}

        {/* Hero Promo Banner Carousel */}
        <View style={styles.bannerContainer}>
          <PromoBanner />
        </View>

        {/* Main Promo Categories Scroll Tabs */}
        <View style={[styles.tabsContainer, isDesktop && styles.desktopTabsContainer]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            <TouchableOpacity
              style={[styles.tabItem, activePromoTab === 'harga_spesial' && styles.tabActive]}
              onPress={() => setActivePromoTab('harga_spesial')}
              activeOpacity={0.7}
            >
              <Ionicons name="pricetag" size={18} color={activePromoTab === 'harga_spesial' ? '#D91E28' : '#64748B'} />
              <Text style={[styles.tabText, activePromoTab === 'harga_spesial' && styles.tabTextActive]}>
                Harga Spesial
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activePromoTab === 'gratis_produk' && styles.tabActive]}
              onPress={() => setActivePromoTab('gratis_produk')}
              activeOpacity={0.7}
            >
              <Ionicons name="gift-outline" size={18} color={activePromoTab === 'gratis_produk' ? '#0284C7' : '#64748B'} />
              <Text style={[styles.tabText, activePromoTab === 'gratis_produk' && styles.tabTextActive]}>
                Gratis Produk
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activePromoTab === 'paket' && styles.tabActive]}
              onPress={() => setActivePromoTab('paket')}
              activeOpacity={0.7}
            >
              <Ionicons name="cube-outline" size={18} color={activePromoTab === 'paket' ? '#0284C7' : '#64748B'} />
              <Text style={[styles.tabText, activePromoTab === 'paket' && styles.tabTextActive]}>
                Paket Hemat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activePromoTab === 'tebus_murah' && styles.tabActive]}
              onPress={() => setActivePromoTab('tebus_murah')}
              activeOpacity={0.7}
            >
              <Ionicons name="flash-outline" size={18} color={activePromoTab === 'tebus_murah' ? '#0284C7' : '#64748B'} />
              <Text style={[styles.tabText, activePromoTab === 'tebus_murah' && styles.tabTextActive]}>
                Tebus Murah
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activePromoTab === 'harga_spesial' && '🔥 Diskon Harga Spesial Minggu Ini'}
            {activePromoTab === 'gratis_produk' && '🎁 Beli 1 Gratis 1 / Hadiah Langsung'}
            {activePromoTab === 'paket' && '📦 Paket Super Hemat Komplit'}
            {activePromoTab === 'tebus_murah' && '⚡ Tebus Murah Mulai Rp 1.000'}
          </Text>
          <Text style={styles.sectionBadge}>{getActiveProducts().length} Produk Promo</Text>
        </View>

        {/* Product Cards Responsive Grid */}
        <View style={styles.gridRow}>
          {getActiveProducts().map((product) => (
            <TouchableOpacity
              key={product.id}
              style={[
                styles.productCard,
                isDesktop ? { width: `calc(${100 / numColumns}% - 14px)` } : styles.mobileProductCard,
              ]}
              onPress={() => onSelectProduct && onSelectProduct(product)}
              activeOpacity={0.85}
            >
              {/* Image & Category Overlay Strip */}
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
                {product.gratisBadge && (
                  <View style={styles.gratisRibbon}>
                    <Ionicons name="gift" size={11} color={COLORS.white} />
                    <Text style={styles.gratisRibbonText}>Gratis</Text>
                  </View>
                )}
              </View>

              {/* Title & Prices */}
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

                {/* Delivery Indicator */}
                <View style={styles.deliveryRow}>
                  <Ionicons
                    name={product.delivery.includes('Instan') ? 'flash' : 'storefront'}
                    size={12}
                    color="#D91E28"
                  />
                  <Text style={styles.deliveryText}>{product.delivery}</Text>
                </View>

                {/* Full-width Add to Cart Button */}
                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => onAddToCart && onAddToCart(product)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cart-outline" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                  <Text style={styles.addToCartBtnText}>+ Keranjang</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  /* Desktop Header Banner */
  desktopBannerHeader: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  desktopBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  desktopBannerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
  },
  desktopBannerSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  bannerContainer: {
    marginVertical: 8,
  },
  /* Scroll Tabs */
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginHorizontal: 0,
  },
  desktopTabsContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 20,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#D91E28',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#D91E28',
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  /* Product Grid */
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 14,
  },
  mobileProductCard: {
    width: '48%',
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageBox: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImg: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },
  categoryStrip: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
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
    top: 8,
    right: 0,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  weightTagText: {
    color: COLORS.textDark,
    fontSize: 10,
    fontWeight: '800',
  },
  gratisRibbon: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#D91E28',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  gratisRibbonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  /* Card Body */
  cardInfo: {
    padding: 12,
    gap: 4,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    minHeight: 36,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 17,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    backgroundColor: COLORS.primaryRed,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  addToCartBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
