import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { formatRupiah } from '../utils/formatters';
import { apiService } from '../services/api';
import OrderDetailModal from './OrderDetailModal';
import PaymentScreen from './PaymentScreen';

export default function NotificationScreen({ visible, onClose, user, onGoToOrders }) {
  const [activeTab, setActiveTab] = useState('pesanan'); // Default tab to 'pesanan' when there are active notifications
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [payingOrder, setPayingOrder] = useState(null);

  const fetchActiveOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await apiService.getUserOrders(user?.id || 1);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Gagal memuat pesanan untuk notifikasi:', e.message);
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    if (visible) {
      fetchActiveOrders();
    }
  }, [visible, fetchActiveOrders]);

  // Unfinished/Active orders are those not finished ('selesai') or cancelled ('batal')
  const activeOrders = orders.filter(
    (o) => o.status === 'menunggu' || o.status === 'diproses' || o.status === 'dikirim'
  );

  const promoList = [
    {
      id: 'p1',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
      title: 'Diskon Spesial Sambal Aida & Saus Swan! 🌶️',
      subtitle: 'Dapatkan potongan langsung Rp 15.000 untuk pembelian bumbu dapur.',
      timestamp: 'Sep 24, 10:00 AM',
    },
    {
      id: 'p2',
      image: 'https://images.unsplash.com/photo-1556742049-0a670fc8078a?w=800&q=80',
      title: 'Hematnya Pas, Belanjanya Puas 🛒',
      subtitle: 'Pakai Kartu Kredit / Debit & dapatkan ekstra potongan Rp 35.000.',
      timestamp: 'Sep 24, 08:30 AM',
    },
  ];

  const infoList = [
    {
      id: 'i1',
      title: '✨ RAMBUT SEHAT, BELANJA HEMAT!',
      date: 'Sep 21',
      subtitle: 'Beli 1 Pantene MRCL H.VIT 5S, dapat potongan Rp4.500!',
    },
    {
      id: 'i2',
      title: 'Barang di Keranjang Anda',
      date: 'Sep 20',
      subtitle: 'Barang favoritmu masih tersimpan di keranjang, checkout yuk sebelum kehabisan!',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Red Top Header Row */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pemberitahuan & Notifikasi</Text>
        </View>

        {/* Dynamic Navigation Tabs Row */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'pesanan' && styles.tabActive]}
            onPress={() => setActiveTab('pesanan')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Text style={[styles.tabText, activeTab === 'pesanan' && styles.tabTextActive]}>
                Pesanan
              </Text>
              {activeOrders.length > 0 && (
                <View style={styles.badgeRed}>
                  <Text style={styles.badgeText}>{activeOrders.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'promo' && styles.tabActive]}
            onPress={() => setActiveTab('promo')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Text style={[styles.tabText, activeTab === 'promo' && styles.tabTextActive]}>
                Promo
              </Text>
              <View style={styles.badgeGray}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
                Info
              </Text>
              <View style={styles.badgeGray}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Notification Container */}
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {activeTab === 'pesanan' ? (
            /* PESANAN BELUM SELSEAI TAB */
            <View style={styles.sectionWrap}>
              {loadingOrders ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color="#D91E28" />
                  <Text style={styles.loadingText}>Memeriksa status pesanan Anda...</Text>
                </View>
              ) : activeOrders.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="checkmark-circle-outline" size={48} color="#16A34A" />
                  </View>
                  <Text style={styles.emptyTitle}>Semua Pesanan Selesai!</Text>
                  <Text style={styles.emptySub}>
                    Tidak ada pesanan aktif atau yang belum diselesaikan saat ini.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.noticeHeaderBox}>
                    <Ionicons name="alert-circle-outline" size={20} color="#D91E28" />
                    <Text style={styles.noticeHeaderTitle}>
                      Ada {activeOrders.length} Pesanan Belum Selesai
                    </Text>
                  </View>

                  {activeOrders.map((order) => {
                    const isUnpaid = order.status === 'menunggu';
                    const isProcessing = order.status === 'diproses';
                    const isShipping = order.status === 'dikirim';

                    const statusBg = isUnpaid ? '#FEE2E2' : isProcessing ? '#FEF3C7' : '#E0F2FE';
                    const statusColor = isUnpaid ? '#DC2626' : isProcessing ? '#D97706' : '#0284C7';
                    const statusTitle = isUnpaid
                      ? 'Belum Bayar — Mohon Selesaikan Pembayaran'
                      : isProcessing
                      ? 'Sedang Diproses Penjual'
                      : 'Dalam Pengiriman Kurir';

                    const actionBtnLabel = isUnpaid ? 'Bayar Sekarang' : 'Detail Pesanan';
                    const actionBtnIcon = isUnpaid ? 'card' : 'receipt-outline';

                    return (
                      <TouchableOpacity
                        key={order.id}
                        style={styles.orderNotificationCard}
                        onPress={() => setSelectedOrderForDetail(order)}
                        activeOpacity={0.92}
                      >
                        {/* Card Header Tag */}
                        <View style={styles.cardTopRow}>
                          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                            <Ionicons
                              name={isUnpaid ? 'time' : isProcessing ? 'sync' : 'bicycle'}
                              size={13}
                              color={statusColor}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                              {order.statusLabel || 'Pesanan Aktif'}
                            </Text>
                          </View>
                          <Text style={styles.orderDate}>{order.date}</Text>
                        </View>

                        <Text style={styles.orderInvTitle}>{order.id}</Text>
                        <Text style={styles.orderNoticeText}>{statusTitle}</Text>

                        <View style={styles.cardDivider} />

                        {/* Order Items Preview */}
                        {(order.items || []).slice(0, 2).map((item, idx) => (
                          <View key={idx} style={styles.itemRowPreview}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <View style={styles.itemMeta}>
                              <Text style={styles.itemName} numberOfLines={1}>
                                {item.name}
                              </Text>
                              <Text style={styles.itemVariant}>Varian: {item.variant || item.name}</Text>
                              <Text style={styles.itemPriceQty}>
                                {formatRupiah(item.price)} x{item.quantity}
                              </Text>
                            </View>
                          </View>
                        ))}

                        {order.items && order.items.length > 2 && (
                          <Text style={styles.moreItemsText}>
                            +{order.items.length - 2} produk lainnya...
                          </Text>
                        )}

                        <View style={styles.cardFooterRow}>
                          <View>
                            <Text style={styles.totalLabel}>Total Tagihan:</Text>
                            <Text style={styles.totalValue}>{formatRupiah(order.totalAmount)}</Text>
                          </View>

                          <View style={styles.actionBtnGroup}>
                            <TouchableOpacity
                              style={[
                                styles.detailActionBtn,
                                isUnpaid && styles.detailActionBtnRed,
                              ]}
                              onPress={(e) => {
                                e.stopPropagation();
                                if (isUnpaid) {
                                  setPayingOrder(order);
                                } else {
                                  setSelectedOrderForDetail(order);
                                }
                              }}
                              activeOpacity={0.8}
                            >
                              <Ionicons name={actionBtnIcon} size={15} color={COLORS.white} />
                              <Text style={styles.detailActionText}>{actionBtnLabel}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}
            </View>
          ) : activeTab === 'promo' ? (
            /* PROMO TAB LIST */
            <View style={styles.promoListWrap}>
              {promoList.map((item) => (
                <View key={item.id} style={styles.promoCard}>
                  <Image source={{ uri: item.image }} style={styles.bannerImg} />
                  <View style={styles.promoContent}>
                    <Text style={styles.promoTitle}>{item.title}</Text>
                    <Text style={styles.promoSub}>{item.subtitle}</Text>
                    <View style={styles.cardDivider} />
                    <Text style={styles.promoTimestamp}>{item.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            /* INFO TAB LIST */
            <View style={styles.infoListWrap}>
              {infoList.map((item) => (
                <View key={item.id} style={styles.infoCard}>
                  <View style={styles.infoRowTop}>
                    <Text style={styles.infoTitle}>{item.title}</Text>
                    <Text style={styles.infoDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.infoSub}>{item.subtitle}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Order Detail Modal */}
      <OrderDetailModal
        visible={!!selectedOrderForDetail}
        onClose={() => setSelectedOrderForDetail(null)}
        order={selectedOrderForDetail}
        onPayNow={(ord) => {
          setSelectedOrderForDetail(null);
          setPayingOrder(ord);
        }}
      />

      {/* Payment Screen Modal */}
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
          fetchActiveOrders();
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#D91E28',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.white,
    marginLeft: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#D91E28',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  badgeRed: {
    backgroundColor: '#D91E28',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeGray: {
    backgroundColor: '#94A3B8',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  /* PESANAN ACTIVE NOTIFICATION STYLES */
  sectionWrap: {
    gap: 12,
  },
  noticeHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  noticeHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  orderNotificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  orderDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  orderInvTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  orderNoticeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  itemRowPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  itemVariant: {
    fontSize: 11,
    color: '#64748B',
  },
  itemPriceQty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D91E28',
  },
  moreItemsText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  actionBtnGroup: {
    flexDirection: 'row',
  },
  detailActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  detailActionBtnRed: {
    backgroundColor: '#D91E28',
  },
  detailActionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  loadingBox: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  /* PROMO LIST STYLES */
  promoListWrap: {
    gap: 14,
  },
  promoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bannerImg: {
    width: '100%',
    height: 150,
    backgroundColor: '#CBD5E1',
  },
  promoContent: {
    padding: 14,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  promoSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 17,
  },
  promoTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
  },
  /* INFO LIST STYLES */
  infoListWrap: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  infoDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  infoSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
});
