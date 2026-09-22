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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';

export default function OrdersScreen({
  openSearch,
  openCart,
  cartCount = 0,
  onAddToCart,
  onGoToShop,
}) {
  const [activeTab, setActiveTab] = useState('semua');
  const [refreshing, setRefreshing] = useState(false);

  // Sample real-life order history data
  const [orders, setOrders] = useState([
    {
      id: 'ORD-20260922-8921',
      date: '22 Sep 2026, 14:30 WIB',
      status: 'dikirim',
      statusLabel: 'Sedang Dikirim',
      statusColor: '#0284C7',
      statusBg: '#E0F2FE',
      type: 'delivery',
      typeLabel: 'Pengiriman Reguler',
      address: 'Jl. Pasir Bokor, Kp. Gunung Jambe, Cipawitra, Tasikmalaya',
      courier: 'Kurir Official Store (Resi: OFC-JKT-88201)',
      items: [
        {
          id: 'p1',
          name: 'ABC Kecap Manis Botol 620 g',
          variant: '620 g',
          price: 24500,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80',
        },
        {
          id: 'p2',
          name: 'Sania Minyak Goreng Pouch 2 L',
          variant: '2 Liter',
          price: 41900,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80',
        },
      ],
      totalAmount: 90900,
      discount: 10000,
      shippingFee: 10000,
    },
    {
      id: 'ORD-20260920-4102',
      date: '20 Sep 2026, 10:15 WIB',
      status: 'selesai',
      statusLabel: 'Selesai',
      statusColor: '#16A34A',
      statusBg: '#DCFCE7',
      type: 'pickup',
      typeLabel: 'Ambil di Toko (Pickup)',
      storeName: 'Official Store Cabang Tasikmalaya Pusat',
      items: [
        {
          id: 'p3',
          name: 'Good Day Kopi Instan Cappuccino 10 x 25 g',
          variant: '10 x 25 g',
          price: 21900,
          quantity: 3,
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80',
        },
      ],
      totalAmount: 65700,
      discount: 0,
      shippingFee: 0,
    },
    {
      id: 'ORD-20260918-1934',
      date: '18 Sep 2026, 19:40 WIB',
      status: 'selesai',
      statusLabel: 'Selesai',
      statusColor: '#16A34A',
      statusBg: '#DCFCE7',
      type: 'delivery',
      typeLabel: 'Pengiriman Instan',
      address: 'Jl. Pasir Bokor, Kp. Gunung Jambe, Cipawitra, Tasikmalaya',
      courier: 'Gojek Instant (Resi: GK-991204)',
      items: [
        {
          id: 'p4',
          name: 'Kara Sun Santan Kelapa Cair Siap Pakai 65 ml',
          variant: '65 ml',
          price: 4700,
          quantity: 5,
          image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&q=80',
        },
        {
          id: 'p5',
          name: 'Tropical Minyak Goreng Botol 2 L',
          variant: '2 Liter',
          price: 43500,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80',
        },
      ],
      totalAmount: 67000,
      discount: 5000,
      shippingFee: 8000,
    },
    {
      id: 'ORD-20260915-0812',
      date: '15 Sep 2026, 08:30 WIB',
      status: 'diproses',
      statusLabel: 'Sedang Diproses',
      statusColor: '#D97706',
      statusBg: '#FEF3C7',
      type: 'pickup',
      typeLabel: 'Ambil di Toko (Pickup)',
      storeName: 'Official Store Cabang Singaparna',
      items: [
        {
          id: 'p6',
          name: 'Paket Sambal Spesial ABC + Terasi Udang',
          variant: 'Bundle Pack',
          price: 38500,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80',
        },
      ],
      totalAmount: 38500,
      discount: 0,
      shippingFee: 0,
    },
  ]);

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
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'menunggu') return order.status === 'menunggu';
    if (activeTab === 'diproses') return order.status === 'diproses';
    if (activeTab === 'dikirim') return order.status === 'dikirim';
    if (activeTab === 'selesai') return order.status === 'selesai';
    if (activeTab === 'batal') return order.status === 'batal';
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
        {filteredOrders.length === 0 ? (
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
            <View key={order.id} style={styles.orderCard}>
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
                  {order.status === 'dikirim' && (
                    <TouchableOpacity
                      style={styles.trackBtn}
                      onPress={() => handleTrackOrder(order)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.trackBtnText}>Lacak</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.reorderBtn}
                    onPress={() => handleReorder(order)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="repeat" size={14} color={COLORS.white} />
                    <Text style={styles.reorderBtnText}>Beli Lagi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D91E28',
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
