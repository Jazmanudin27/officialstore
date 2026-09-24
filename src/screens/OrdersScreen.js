import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';
import OrderDetailModal from './OrderDetailModal';
import PaymentScreen from './PaymentScreen';

export default function OrdersScreen({
  openSearch,
  openCart,
  cartCount = 0,
  onAddToCart,
  onGoToShop,
  user,
  onOpenAuth,
}) {
  const [activeTab, setActiveTab] = useState('semua');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [payingOrder, setPayingOrder] = useState(null);
  const isLoggedIn = true; // Always allow viewing orders for user session

  const fetchOrders = useCallback(async (showLoading = true) => {
    let targetUserId = user?.id;
    if (!targetUserId) {
      try {
        const saved = storage.getItem('official_store_user_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          targetUserId = parsed?.id;
        }
      } catch (e) {}
    }
    targetUserId = targetUserId || 1;

    if (showLoading) setLoading(true);
    try {
      const data = await apiService.getUserOrders(targetUserId);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Gagal memuat pesanan:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders(true);
  }, [fetchOrders, activeTab]);

  const tabs = [
    { id: 'semua', label: 'Semua' },
    { id: 'menunggu', label: 'Belum Bayar' },
    { id: 'diproses', label: 'Diproses' },
    { id: 'dikirim', label: 'Dikirim' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'batal', label: 'Dibatalkan' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(false);
  };

  const filteredOrders = orders.filter((order) => {
    const st = String(order.status || '').toLowerCase().trim();
    if (activeTab === 'semua') return true;
    if (activeTab === 'menunggu') return st === 'menunggu' || st === 'pending' || st.includes('menunggu') || st.includes('belum');
    if (activeTab === 'diproses') return st === 'diproses' || st === 'processing' || st.includes('proses');
    if (activeTab === 'dikirim') return st === 'dikirim' || st === 'shipped' || st.includes('kirim');
    if (activeTab === 'selesai') return st === 'selesai' || st === 'completed';
    if (activeTab === 'batal') return st === 'batal' || st === 'cancelled';
    return true;
  });

  const handleReorder = (order) => {
    if (onAddToCart) {
      order.items.forEach((item) => {
        onAddToCart(item);
      });
      Alert.alert(
        'Produk Ditambahkan!',
        'Semua item dari pesanan ini telah dimasukkan kembali ke keranjang belanja Anda.',
        [
          { text: 'Lanjut Belanja' },
          { text: 'Buka Keranjang', onPress: openCart },
        ]
      );
    }
  };

  const handleTrackOrder = (order) => {
    Alert.alert(
      'Lacak Pengiriman',
      `Nomor Pesanan: ${order.id}\nKurir: ${order.courier || 'Kurir Toko'}\nStatus: Paket dalam perjalanan menuju lokasi Anda.`,
      [{ text: 'Tutup' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Red Header (Matching Promo screen) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesanan Saya</Text>
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

      {!isLoggedIn ? (
        /* GUEST / NOT LOGGED IN STATE */
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={48} color="#D91E28" />
          </View>
          <Text style={styles.emptyTitle}>Belum Masuk Akun</Text>
          <Text style={styles.emptySub}>
            Silakan masuk atau daftar terlebih dahulu untuk melihat riwayat transaksi dan melacak pesanan Anda.
          </Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={onOpenAuth}
            activeOpacity={0.85}
          >
            <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
            <Text style={styles.shopNowBtnText}>Masuk / Daftar Sekarang</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Filter Status Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScroll}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.tabItem, isActive && styles.tabActive]}
                    onPress={() => setActiveTab(tab.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Orders List Content */}
          <ScrollView
            style={styles.orderList}
            contentContainerStyle={styles.orderListContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D91E28']} />
            }
          >
            {loading && !refreshing ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#D91E28" />
                <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13, fontWeight: '600' }}>
                  Memuat pesanan dari database...
                </Text>
              </View>
            ) : filteredOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>Belum Ada Pesanan</Text>
                <Text style={styles.emptySub}>
                  Tidak ada riwayat transaksi pada kategori ini saat ini.
                </Text>
                <TouchableOpacity
                  style={styles.shopNowBtn}
                  onPress={onGoToShop}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cart-outline" size={18} color={COLORS.white} />
                  <Text style={styles.shopNowBtnText}>Mulai Belanja Sekarang</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => setSelectedOrderForDetail(order)}
                  activeOpacity={0.92}
                >
                  {/* Card Header: Type & Status */}
                  <View style={styles.cardHeader}>
                    <View style={styles.typeBadgeRow}>
                      <Ionicons
                        name={order.type === 'pickup' ? 'storefront-outline' : 'bicycle-outline'}
                        size={16}
                        color="#0284C7"
                      />
                      <Text style={styles.typeBadgeText}>{order.typeLabel}</Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: order.statusBg }]}>
                      <Text style={[styles.statusBadgeText, { color: order.statusColor }]}>
                        {order.statusLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Order Metadata */}
                  <View style={styles.metaRow}>
                    <Text style={styles.orderIdText}>{order.id}</Text>
                    <Text style={styles.orderDateText}>{order.date}</Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Products List in this order */}
                  {order.items.map((item, idx) => (
                    <View key={idx} style={styles.productRow}>
                      <Image source={{ uri: item.image }} style={styles.productImage} />
                      <View style={styles.productDetails}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.productVariant}>Varian: {item.variant}</Text>
                        <View style={styles.productPriceRow}>
                          <Text style={styles.productPrice}>
                            {formatRupiah(item.price)}
                          </Text>
                          <Text style={styles.productQty}>x{item.quantity}</Text>
                        </View>
                      </View>
                    </View>
                  ))}

                  <View style={styles.divider} />

                  {/* Order Total & Actions */}
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.totalLabel}>Total Pembayaran</Text>
                      <Text style={styles.totalValue}>{formatRupiah(order.totalAmount)}</Text>
                    </View>

                    <View style={styles.actionButtonsRow}>
                      {order.status === 'menunggu' && (
                        <TouchableOpacity
                          style={styles.payBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            setPayingOrder(order);
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="card-outline" size={14} color="#FFFFFF" />
                          <Text style={styles.payBtnText}>Bayar Sekarang</Text>
                        </TouchableOpacity>
                      )}

                      {order.status === 'dikirim' && (
                        <TouchableOpacity
                          style={styles.trackBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleTrackOrder(order);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.trackBtnText}>Lacak</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.reorderBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleReorder(order);
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="repeat" size={14} color={COLORS.white} />
                        <Text style={styles.reorderBtnText}>Beli Lagi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        visible={!!selectedOrderForDetail}
        onClose={() => setSelectedOrderForDetail(null)}
        order={selectedOrderForDetail}
        onPayNow={(ord) => {
          setSelectedOrderForDetail(null);
          setPayingOrder(ord);
        }}
        onReorder={(ord) => handleReorder(ord)}
      />

      {/* Payment Screen Modal when Bayar Sekarang is clicked */}
      <PaymentScreen
        visible={!!payingOrder}
        onClose={() => setPayingOrder(null)}
        finalTotal={payingOrder?.totalAmount || 0}
        subtotal={payingOrder?.productTotal || payingOrder?.totalAmount || 0}
        deliveryFee={payingOrder?.shippingFee || 0}
        discountAmount={payingOrder?.discount || 0}
        selectedAddress={{ addressLine1: payingOrder?.address || 'Alamat Kirim' }}
        cartItems={payingOrder?.items || []}
        user={user}
        onCompleteCheckout={() => {
          setPayingOrder(null);
          fetchOrders(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  /* Top Red Header */
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
  /* Filter Tabs */
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tabItem: {
    paddingVertical: 12,
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
  /* Orders List */
  orderList: {
    flex: 1,
  },
  orderListContent: {
    padding: 14,
    paddingBottom: 90,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  orderDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  /* Product inside card */
  productRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  productImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  productVariant: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D91E28',
  },
  productQty: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  /* Card Footer */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trackBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D91E28',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  payBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005691',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  reorderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  /* Empty state */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  shopNowBtn: {
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
  shopNowBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
