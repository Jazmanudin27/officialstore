import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';
import ProductCard from '../components/product/ProductCard';
import ScrollReveal from '../components/common/ScrollReveal';

export default function ExploreScreen({
  products = [],
  favorites = [],
  isFavorite = () => false,
  onToggleFavorite = () => {},
  onAddToCart,
  onUpdateQuantity,
  getItemQuantity,
  openSearch,
  openCart,
  cartCount = 0,
  onRefresh,
  refreshing = false,
  onSelectProduct,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : 2;
  const itemWidthPercent = `${100 / numColumns}%`;

  const [activeTab, setActiveTab] = useState('rutin'); // 'rutin' | 'favorit'
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [internalRefreshing, setInternalRefreshing] = useState(false);

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

  // Kategori Resmi dari Database
  const categories = [
    { id: 'all', name: 'Semua', icon: 'grid-outline' },
    { id: 'c1', name: 'AIDA', icon: 'flame-outline' },
    { id: 'c2', name: 'SAUS SWAN', icon: 'restaurant-outline' },
    { id: 'c3', name: 'BUMBU TABUR', icon: 'sparkles-outline' },
    { id: 'c4', name: 'PREMIUM POUCH', icon: 'bag-handle-outline' },
    { id: 'c5', name: 'SAMBAL CABE', icon: 'nutrition-outline' },
    { id: 'c6', name: 'SAUS PREMIUM', icon: 'star-outline' },
    { id: 'c7', name: 'SAOSME', icon: 'pricetag-outline' },
  ];

  // Filter Produk Berdasarkan Kategori untuk Tab Belanja Rutin
  const filteredProducts = products.filter((item) => {
    if (selectedCategory === 'Semua') return true;
    return item.category === selectedCategory;
  });

  // Filter Produk Favorit (yang di klik ikon Love / Heart)
  const favoriteProducts = products.filter((item) => isFavorite(item.id));

  // Produk Rekomendasi Rutin (Populer)
  const routinePopular = products.filter((p) => p.isPopuler).slice(0, 6);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Solid Red Header (Mobile Only) */}
      {!isDesktop && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daftar Belanja</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={openSearch} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="search-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity onPress={openCart} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="bag-handle-outline" size={22} color={COLORS.white} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Top Tabs: Belanja Rutin vs Belanja Favorit */}
      <View style={[styles.tabsRow, isDesktop && styles.desktopTabsRow]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'rutin' && styles.tabActive]}
          onPress={() => setActiveTab('rutin')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="cart-outline"
            size={18}
            color={activeTab === 'rutin' ? '#D91E28' : '#64748B'}
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
            name={activeTab === 'favorit' ? 'heart' : 'heart-outline'}
            size={18}
            color={activeTab === 'favorit' ? '#D91E28' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'favorit' && styles.tabTextActive]}>
            Belanja Favorit
          </Text>
          {favoriteProducts.length > 0 && (
            <View style={styles.favCountBadge}>
              <Text style={styles.favCountText}>{favoriteProducts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Layout Container (2-Column on Desktop) */}
      <View style={[styles.mainLayoutWrapper, isDesktop && styles.desktopLayoutRow]}>
        {/* Desktop Left Sidebar Category Navigation */}
        {isDesktop && activeTab === 'rutin' && (
          <View style={styles.desktopSidebar}>
            <Text style={styles.sidebarTitle}>Kategori Produk</Text>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.sidebarCatItem, isSelected && styles.sidebarCatItemActive]}
                  onPress={() => setSelectedCategory(cat.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={cat.icon}
                    size={18}
                    color={isSelected ? '#D91E28' : '#64748B'}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={[styles.sidebarCatText, isSelected && styles.sidebarCatTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <ScrollView
          style={[styles.container, isDesktop && { flex: 1 }]}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isPullRefreshing}
              onRefresh={handlePullDownRefresh}
              colors={['#D91E28', '#0284C7']}
              tintColor="#D91E28"
              title="Memuat data belanja..."
              titleColor="#64748B"
            />
          }
        >
        {activeTab === 'favorit' ? (
          /* =================================================== */
          /* TAB 2: BELANJA FAVORIT (PRODUK YANG DI-KLIK LOVE)   */
          /* =================================================== */
          <View style={styles.favoriteSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.favTitleWrap}>
                <Ionicons name="heart" size={20} color="#D91E28" />
                <Text style={styles.sectionTitle}>Produk Favorit Saya</Text>
              </View>
              <Text style={styles.favItemCountText}>
                {favoriteProducts.length} Produk Disimpan
              </Text>
            </View>

            {favoriteProducts.length === 0 ? (
              <View style={styles.emptyFavBox}>
                <View style={styles.emptyFavCircle}>
                  <Ionicons name="heart-dislike-outline" size={50} color="#CBD5E1" />
                </View>
                <Text style={styles.emptyFavTitle}>Belum Ada Produk Favorit</Text>
                <Text style={styles.emptyFavSub}>
                  Klik ikon love (❤️) pada produk yang Anda sukai di Beranda atau Belanja Rutin untuk menyimpannya di sini.
                </Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => setActiveTab('rutin')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="storefront-outline" size={18} color={COLORS.white} />
                  <Text style={styles.exploreBtnText}>Jelajahi Produk Sekarang</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.productGridRow}>
                {favoriteProducts.map((item, idx) => (
                  <View key={item.id} style={[styles.gridItemWrapper, { width: itemWidthPercent }]}>
                    <ScrollReveal index={idx}>
                      <ProductCard
                        product={item}
                        onAddToCart={onAddToCart}
                        onUpdateQuantity={onUpdateQuantity}
                        cartQuantity={getItemQuantity ? getItemQuantity(item.id) : 0}
                        isFavorite={true}
                        onToggleFavorite={onToggleFavorite}
                        onSelectProduct={onSelectProduct}
                      />
                    </ScrollReveal>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* =================================================== */
          /* TAB 1: BELANJA RUTIN                               */
          /* =================================================== */
          <>
            {/* Section 1: Kategori Produk Horizontal Filter */}
            <View style={styles.categoryFilterContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryFilterScroll}
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catPill, isSelected && styles.catPillActive]}
                      onPress={() => setSelectedCategory(cat.name)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={15}
                        color={isSelected ? COLORS.white : '#475569'}
                      />
                      <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Section 2: Rekomendasi Rutin Populer (Carousel) */}
            {routinePopular.length > 0 && selectedCategory === 'Semua' && (
              <View style={styles.routineSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>🔥 Produk Rutin & Terlaris</Text>
                  <Text style={styles.lihatSemuaText}>Favorit Pelanggan</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.routineScroll}
                >
                  {routinePopular.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.routineCard}
                      onPress={() => onSelectProduct && onSelectProduct(item)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.imageBox}>
                        <Image source={{ uri: item.image }} style={styles.productImg} />
                        <View style={styles.categoryStrip}>
                          <Text style={styles.categoryStripText}>{item.category || 'Official'}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.favSmallBtn}
                          onPress={() => onToggleFavorite(item.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                            size={16}
                            color={isFavorite(item.id) ? '#D91E28' : '#94A3B8'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.cardInfo}>
                        <Text style={styles.productTitle} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.productPrice}>{formatRupiah(item.price)}</Text>

                        {getItemQuantity && getItemQuantity(item.id) > 0 ? (
                          <View style={styles.cardStepperRow}>
                            <TouchableOpacity
                              style={styles.cardStepperBtn}
                              onPress={() => onUpdateQuantity && onUpdateQuantity(item.id, getItemQuantity(item.id) - 1)}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name={getItemQuantity(item.id) === 1 ? 'trash-outline' : 'remove'}
                                size={14}
                                color="#D91E28"
                              />
                            </TouchableOpacity>

                            <Text style={styles.cardStepperValue}>{getItemQuantity(item.id)}</Text>

                            <TouchableOpacity
                              style={styles.cardStepperBtn}
                              onPress={() => onUpdateQuantity && onUpdateQuantity(item.id, getItemQuantity(item.id) + 1)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="add" size={14} color="#D91E28" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.addToCartBtn}
                            onPress={() => onAddToCart && onAddToCart(item)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.addToCartBtnText}>+ Beli</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Section 3: Daftar Produk Lengkap (2-Column Grid) */}
            <View style={styles.allProductsSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'Semua'
                    ? 'Semua Produk Resmi (PCS & DUS)'
                    : `Produk ${selectedCategory}`}
                </Text>
                <Text style={styles.productCountBadge}>
                  {filteredProducts.length} Produk
                </Text>
              </View>

              <View style={styles.productGridRow}>
                {filteredProducts.map((product, idx) => (
                  <View key={product.id} style={[styles.gridItemWrapper, { width: itemWidthPercent }]}>
                    <ScrollReveal index={idx}>
                      <ProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        onUpdateQuantity={onUpdateQuantity}
                        cartQuantity={getItemQuantity ? getItemQuantity(product.id) : 0}
                        isFavorite={isFavorite(product.id)}
                        onToggleFavorite={onToggleFavorite}
                        onSelectProduct={onSelectProduct}
                      />
                    </ScrollReveal>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainLayoutWrapper: {
    flex: 1,
  },
  desktopLayoutRow: {
    flexDirection: 'row',
    width: '100%',
    flex: 1,
  },
  desktopSidebar: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    padding: 16,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  sidebarCatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  sidebarCatItemActive: {
    backgroundColor: '#FEF2F2',
  },
  sidebarCatText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  sidebarCatTextActive: {
    color: '#D91E28',
    fontWeight: '800',
  },
  desktopTabsRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
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
    fontSize: 20,
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
    paddingVertical: 13,
    gap: 6,
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
  favCountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 2,
  },
  favCountText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
  },
  /* Container Scroll */
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  /* Category Pills */
  categoryFilterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryFilterScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  catPillActive: {
    backgroundColor: '#D91E28',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  catPillTextActive: {
    color: COLORS.white,
  },
  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  lihatSemuaText: {
    fontSize: 12,
    color: '#D91E28',
    fontWeight: '700',
  },
  productCountBadge: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  /* Routine Scroll */
  routineSection: {
    marginBottom: 4,
  },
  routineScroll: {
    paddingHorizontal: 14,
    gap: 12,
    paddingBottom: 6,
  },
  routineCard: {
    width: 145,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  imageBox: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryStrip: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryStripText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },
  favSmallBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.white,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInfo: {
    padding: 8,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
    height: 32,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D91E28',
    marginBottom: 8,
  },
  addToCartBtn: {
    backgroundColor: '#D91E28',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  cardStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  cardStepperBtn: {
    padding: 3,
  },
  cardStepperValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D91E28',
  },
  /* Grid Products */
  allProductsSection: {
    paddingTop: 6,
  },
  productGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 6,
  },
  gridItemWrapper: {
    width: '50%',
    padding: 4,
  },
  /* Favorite Section */
  favoriteSection: {
    paddingTop: 6,
  },
  favTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  favItemCountText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyFavBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyFavCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyFavTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  emptyFavSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D91E28',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#D91E28',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  exploreBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
