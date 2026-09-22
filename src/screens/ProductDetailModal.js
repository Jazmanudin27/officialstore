import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  Share,
  Alert,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';

export default function ProductDetailModal({
  visible,
  product,
  onClose,
  onAddToCart,
  onUpdateQuantity,
  cartQuantity = 0,
  isFavorite = false,
  onToggleFavorite,
  openCart,
  cartCount = 0,
  onBuyNow,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [selectedTab, setSelectedTab] = useState('deskripsi'); // 'deskripsi' | 'ulasan'
  const [selectedSatuan, setSelectedSatuan] = useState(product?.satuan || 'PCS');
  const [qtyInput, setQtyInput] = useState(1);

  if (!product) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Beli ${product.name} harga Rp ${product.price?.toLocaleString()} di Official Store! Produk 100% Asli & Terjamin.`,
      });
    } catch (error) {
      console.log('Error sharing product:', error);
    }
  };

  const handleAddToCartDetail = () => {
    if (onAddToCart) {
      for (let i = 0; i < qtyInput; i++) {
        onAddToCart(product);
      }
      Alert.alert('Sukses', `${qtyInput}x ${product.name} telah ditambahkan ke keranjang!`);
    }
  };

  const handleBuyNowDetail = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
    onClose();
    if (onBuyNow) {
      onBuyNow(product);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType={isDesktop ? 'fade' : 'slide'}
      transparent={isDesktop}
      onRequestClose={onClose}
    >
      <View style={isDesktop ? styles.desktopOverlay : { flex: 1 }}>
        <View style={isDesktop ? styles.desktopModalCard : styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Detail Produk
          </Text>

          <View style={styles.headerRightActions}>
            <TouchableOpacity onPress={handleShare} style={styles.headerIconBtn} activeOpacity={0.7}>
              <Ionicons name="share-social-outline" size={22} color={COLORS.textDark} />
            </TouchableOpacity>

            <TouchableOpacity onPress={openCart} style={styles.headerIconBtn} activeOpacity={0.7}>
              <Ionicons name="bag-handle-outline" size={22} color={COLORS.textDark} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Product Details */}
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Main Hero Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />

            {/* Badges */}
            {product.officialBadge && (
              <View style={styles.officialBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
                <Text style={styles.officialText}>100% Official Original</Text>
              </View>
            )}

            {product.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>DISKON {product.discount}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.favFloatingBtn}
              onPress={() => onToggleFavorite && onToggleFavorite(product.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? '#D91E28' : '#64748B'}
              />
            </TouchableOpacity>
          </View>

          {/* Price & Primary Info */}
          <View style={styles.mainInfoCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>{formatRupiah(product.price)}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPriceText}>{formatRupiah(product.originalPrice)}</Text>
              )}
              {product.discount && (
                <View style={styles.discPill}>
                  <Text style={styles.discPillText}>{product.discount} OFF</Text>
                </View>
              )}
            </View>

            <Text style={styles.productTitle}>{product.name}</Text>

            {/* Rating & Sales Stats */}
            <View style={styles.statsRow}>
              <View style={styles.ratingWrap}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingValue}>{product.rating || '4.9'}</Text>
                <Text style={styles.ratingCount}>(128 Ulasan)</Text>
              </View>

              <View style={styles.statDot} />

              <Text style={styles.soldText}>{product.sold || 0} Terjual</Text>

              <View style={styles.statDot} />

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.category || 'Official'}</Text>
              </View>
            </View>
          </View>

          {/* Official Guarantee Strip */}
          <View style={styles.guaranteeStrip}>
            <View style={styles.guaranteeItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#D91E28" />
              <Text style={styles.guaranteeText}>100% Produk Asli</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Ionicons name="car-outline" size={18} color="#0284C7" />
              <Text style={styles.guaranteeText}>Bebas Ongkir</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Ionicons name="storefront-outline" size={18} color="#16A34A" />
              <Text style={styles.guaranteeText}>Siap Ambil di Toko</Text>
            </View>
          </View>

          {/* Satuan & Varian Selector */}
          <View style={styles.variantSection}>
            <Text style={styles.sectionTitle}>Pilih Kemasan / Satuan</Text>
            <View style={styles.variantRow}>
              {['PCS', 'DUS'].map((satuan) => (
                <TouchableOpacity
                  key={satuan}
                  style={[
                    styles.variantChip,
                    selectedSatuan === satuan && styles.variantChipActive,
                  ]}
                  onPress={() => setSelectedSatuan(satuan)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={satuan === 'DUS' ? 'cube-outline' : 'pricetag-outline'}
                    size={16}
                    color={selectedSatuan === satuan ? COLORS.white : '#475569'}
                  />
                  <Text
                    style={[
                      styles.variantText,
                      selectedSatuan === satuan && styles.variantTextActive,
                    ]}
                  >
                    Kemasan {satuan}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Atur Jumlah Pembelian */}
          <View style={styles.qtySection}>
            <Text style={styles.sectionTitle}>Jumlah Pembelian</Text>
            <View style={styles.qtyRow}>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQtyInput(Math.max(1, qtyInput - 1))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={18} color={qtyInput <= 1 ? '#94A3B8' : '#D91E28'} />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{qtyInput}</Text>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQtyInput(qtyInput + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color="#D91E28" />
                </TouchableOpacity>
              </View>
              <Text style={styles.subtotalText}>
                Total: <Text style={styles.subtotalValue}>{formatRupiah(product.price * qtyInput)}</Text>
              </Text>
            </View>
          </View>

          {/* Tab Menu: Deskripsi Produk & Ulasan Pembeli */}
          <View style={styles.tabSection}>
            <View style={styles.tabHeaderRow}>
              <TouchableOpacity
                style={[styles.tabBtn, selectedTab === 'deskripsi' && styles.tabBtnActive]}
                onPress={() => setSelectedTab('deskripsi')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, selectedTab === 'deskripsi' && styles.tabTextActive]}>
                  Deskripsi Produk
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, selectedTab === 'ulasan' && styles.tabBtnActive]}
                onPress={() => setSelectedTab('ulasan')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, selectedTab === 'ulasan' && styles.tabTextActive]}>
                  Ulasan Pembeli (128)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabContentBox}>
              {selectedTab === 'deskripsi' ? (
                <View>
                  <View style={styles.specGrid}>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Kategori</Text>
                      <Text style={styles.specValue}>{product.category || 'Bumbu & Saus'}</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>SKU Produk</Text>
                      <Text style={styles.specValue}>{product.sku || product.id}</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Berat Produk</Text>
                      <Text style={styles.specValue}>{product.weight || 500} gram</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Kondisi</Text>
                      <Text style={styles.specValue}>Baru (Fresh Stock)</Text>
                    </View>
                  </View>

                  <Text style={styles.descBodyText}>
                    {product.name} diproduksi secara higienis menggunakan bahan olahan terbaik terpilih.
                    Cocok untuk melengkapi cita rasa masakan dapur, jualan kuliner, serta hidangan santapan keluarga.
                    {'\n\n'}
                    • Kualitas Asli 100% Pabrik Official{'\n'}
                    • Kemasan Sehat & Tersegel Rapi{'\n'}
                    • Masa Kadaluarsa Masih Panjang (Fresh Production){'\n'}
                    • Siap kirim via Kurir Instan / Sameday / Ambil di Toko.
                  </Text>
                </View>
              ) : (
                <View style={styles.reviewList}>
                  <View style={styles.reviewCard}>
                    <View style={styles.reviewUserRow}>
                      <View style={styles.reviewAvatar}>
                        <Ionicons name="person" size={16} color="#D91E28" />
                      </View>
                      <View>
                        <Text style={styles.reviewUserName}>Budi Santoso</Text>
                        <View style={styles.starRow}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Ionicons key={s} name="star" size={12} color="#F59E0B" />
                          ))}
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>
                      Barang ori 100%, rasa pedas mantap! Pengiriman Tasikmalaya sangat cepat, pesanan aman tidak ada bocor.
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <View style={styles.reviewUserRow}>
                      <View style={styles.reviewAvatar}>
                        <Ionicons name="person" size={16} color="#0284C7" />
                      </View>
                      <View>
                        <Text style={styles.reviewUserName}>Siti Rahmawati</Text>
                        <View style={styles.starRow}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Ionicons key={s} name="star" size={12} color="#F59E0B" />
                          ))}
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>
                      Langganan beli saus dan bumbu di Official Store. Harga paling bersaing dan packing dus sangat tebal!
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.chatSellerBtn}
            onPress={() => Alert.alert('Chat penjual', 'Fitur pesan langsung WhatsApp aktif!')}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#64748B" />
            <Text style={styles.chatSellerText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addCartBtn}
            onPress={handleAddToCartDetail}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={18} color="#D91E28" />
            <Text style={styles.addCartText}>+ Keranjang</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyNowBtn}
            onPress={handleBuyNowDetail}
            activeOpacity={0.85}
          >
            <Text style={styles.buyNowText}>Beli Sekarang</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  desktopOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  desktopModalCard: {
    width: 650,
    maxHeight: '88%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    position: 'relative',
    padding: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: '#D91E28',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  /* Image Banner */
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    backgroundColor: '#FFFFFF',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  officialBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#D91E28',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  officialText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  favFloatingBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: COLORS.white,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  /* Main Info Card */
  mainInfoCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D91E28',
  },
  originalPriceText: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discPillText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 24,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  ratingCount: {
    fontSize: 12,
    color: '#64748B',
  },
  statDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  soldText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
  },
  /* Guarantee Strip */
  guaranteeStrip: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  /* Variant Section */
  variantSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  variantRow: {
    flexDirection: 'row',
    gap: 10,
  },
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  variantChipActive: {
    backgroundColor: '#D91E28',
    borderColor: '#D91E28',
  },
  variantText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  variantTextActive: {
    color: COLORS.white,
  },
  /* Quantity Section */
  qtySection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepperBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    minWidth: 32,
    textAlign: 'center',
  },
  subtotalText: {
    fontSize: 13,
    color: '#64748B',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D91E28',
  },
  /* Tab Section */
  tabSection: {
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#D91E28',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#D91E28',
    fontWeight: '800',
  },
  tabContentBox: {
    padding: 16,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  specItem: {
    width: '46%',
  },
  specLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  descBodyText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  reviewList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewUserName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  /* Bottom Action Bar */
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  chatSellerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chatSellerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  addCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  addCartText: {
    color: '#D91E28',
    fontSize: 14,
    fontWeight: '800',
  },
  buyNowBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D91E28',
    paddingVertical: 12,
    borderRadius: 10,
  },
  buyNowText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
