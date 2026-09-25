import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
  SafeAreaView,
  Linking,
  Platform,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';
import { apiService } from '../services/api';
import { sweetAlert } from '../components/common/SweetAlert';

export default function OrderDetailModal({
  visible,
  onClose,
  order,
  onPayNow,
  onReorder,
  onCancelOrder,
  onUpdateOrderAddress,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(order?.address || '');
  const [currentAddress, setCurrentAddress] = useState(order?.address || '');

  useEffect(() => {
    setAddressInput(order?.address || '');
    setCurrentAddress(order?.address || '');
    setIsEditingAddress(false);
  }, [order?.address, order?.id]);

  if (!visible || !order) return null;

  const isCanEditAddress =
    order.status === 'pending' ||
    order.status === 'menunggu' ||
    order.status === 'unpaid' ||
    order.status === 'belum_bayar' ||
    order.status === 'unprocessed' ||
    order.status === 'belum_diproses';

  const handleSaveAddress = async () => {
    if (!addressInput || !addressInput.trim()) {
      sweetAlert({
        type: 'warning',
        title: 'Perhatian',
        text: 'Alamat pengiriman tidak boleh kosong.',
      });
      return;
    }

    try {
      await apiService.updateOrderAddress(order.id || order.nomorPesanan, addressInput.trim());
      setCurrentAddress(addressInput.trim());
      if (order) {
        order.address = addressInput.trim();
        order.snapshotAlamatKirim = addressInput.trim();
      }
      setIsEditingAddress(false);
      if (onUpdateOrderAddress) {
        onUpdateOrderAddress(order.id || order.nomorPesanan, addressInput.trim());
      }
      sweetAlert({
        type: 'success',
        title: 'Alamat Diperbarui',
        text: 'Alamat pengiriman pesanan Anda telah berhasil diperbarui.',
      });
    } catch (e) {
      sweetAlert({
        type: 'error',
        title: 'Gagal',
        text: 'Gagal memperbarui alamat pengiriman.',
      });
    }
  };

  const getStatusBanner = () => {
    if (order.status === 'menunggu') {
      return {
        bg: '#FEE2E2',
        border: '#FECACA',
        icon: 'time-outline',
        iconColor: '#DC2626',
        title: 'Pesanan Belum Dibayar',
        subtitle: 'Mohon lakukan pembayaran untuk memproses pesanan Anda.',
        actionBtn: true,
      };
    } else if (order.status === 'diproses' || order.status === 'processing') {
      return {
        bg: '#DBEAFE',
        border: '#BFDBFE',
        icon: 'clipboard-outline',
        iconColor: '#2563EB',
        title: order.statusLabel || 'Pesanan Diterima & Sedang Diproses',
        subtitle: 'Penjual telah menerima pesanan Anda dan siap untuk mengemas.',
        actionBtn: false,
      };
    } else if (order.status === 'dikemas' || order.status === 'packing') {
      return {
        bg: '#F3E8FF',
        border: '#DDD6FE',
        icon: 'cube-outline',
        iconColor: '#7C3AED',
        title: 'Pesanan Sedang Dikemas',
        subtitle: 'Penjual sedang membungkus & mengemas paket pesanan Anda.',
        actionBtn: false,
      };
    } else if (order.status === 'dikirim' || order.status === 'shipped') {
      return {
        bg: '#E0F2FE',
        border: '#BAE6FD',
        icon: 'bicycle-outline',
        iconColor: '#0284C7',
        title: 'Pesanan Sedang Dikirim',
        subtitle: 'Paket dalam perjalanan menuju lokasi alamat pengiriman.',
        actionBtn: false,
      };
    } else if (order.status === 'selesai') {
      return {
        bg: '#DCFCE7',
        border: '#BBF7D0',
        icon: 'checkmark-circle-outline',
        iconColor: '#16A34A',
        title: 'Pesanan Selesai',
        subtitle: 'Terima kasih telah berbelanja di Official Store Tasikmalaya!',
        actionBtn: false,
      };
    } else {
      return {
        bg: '#F1F5F9',
        border: '#E2E8F0',
        icon: 'close-circle-outline',
        iconColor: '#64748B',
        title: 'Pesanan Dibatalkan',
        subtitle: 'Transaksi pesanan ini telah dibatalkan.',
        actionBtn: false,
      };
    }
  };

  const banner = getStatusBanner();
  const items = order.items || [];
  const productSubtotal = items.reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1),
    0
  );

  const canCancel =
    order.status === 'menunggu' ||
    order.status === 'diproses' ||
    order.status === 'processing' ||
    order.status === 'pending';
  const isCompleted = order.status === 'selesai' || order.status === 'completed';

  return (
    <Modal
      visible={visible}
      animationType={isDesktop ? 'fade' : 'slide'}
      transparent={isDesktop}
      onRequestClose={onClose}
    >
      <View style={isDesktop ? styles.desktopOverlay : { flex: 1 }}>
        <View style={isDesktop ? styles.desktopModalCard : styles.safeArea}>
          {/* Top Red Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.headerTitle}>Detail Pesanan</Text>
              <Text style={styles.headerSub}>{order.id}</Text>
            </View>
          </View>

          <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Order Status Banner */}
            <View style={[styles.statusBannerBox, { backgroundColor: banner.bg, borderColor: banner.border }]}>
              <Ionicons name={banner.icon} size={24} color={banner.iconColor} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusBannerTitle, { color: banner.iconColor }]}>
                  {banner.title}
                </Text>
                <Text style={styles.statusBannerSub}>{banner.subtitle}</Text>
              </View>
            </View>

            {/* Pay Now Button if Unpaid */}
            {order.status === 'menunggu' && (
              <TouchableOpacity
                style={styles.payNowBtn}
                onPress={() => {
                  onClose();
                  if (onPayNow) onPayNow(order);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="card-outline" size={20} color={COLORS.white} />
                <Text style={styles.payNowBtnText}>
                  Bayar Sekarang ({formatRupiah(order.totalAmount)})
                </Text>
              </TouchableOpacity>
            )}

            {/* Delivery Address & Recipient Card */}
            <View style={styles.cardContainer}>
              <View style={[styles.cardHeaderRow, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="location-outline" size={20} color="#D91E28" />
                  <Text style={styles.cardHeaderTitle}>Info Pengiriman & Alamat</Text>
                </View>
                {isCanEditAddress && !isEditingAddress && (
                  <TouchableOpacity
                    style={styles.editAddrBadge}
                    onPress={() => setIsEditingAddress(true)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="create-outline" size={13} color="#0284C7" />
                    <Text style={styles.editAddrBadgeText}>Ubah Alamat</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.cardContent}>
                <View style={styles.badgeRow}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {order.type === 'pickup' ? 'Ambil di Toko (Pickup)' : 'Kirim ke Alamat'}
                    </Text>
                  </View>
                  {order.courier && (order.status === 'shipped' || order.status === 'dikirim' || order.status === 'completed' || order.status === 'selesai') && (
                    <Text style={styles.courierText}>Kurir: {order.courier}</Text>
                  )}
                </View>

                {!isEditingAddress ? (
                  <Text style={styles.addressLine}>{currentAddress || order.address}</Text>
                ) : (
                  <View style={styles.editAddressFormBox}>
                    <Text style={styles.editAddressLabel}>Tuliskan Alamat Pengiriman Baru:</Text>
                    <TextInput
                      style={styles.editAddressTextInput}
                      value={addressInput}
                      onChangeText={setAddressInput}
                      placeholder="Masukkan alamat pengiriman baru secara lengkap..."
                      multiline
                      numberOfLines={3}
                    />
                    <View style={styles.editAddressBtnRow}>
                      <TouchableOpacity
                        style={styles.cancelAddressBtn}
                        onPress={() => {
                          setAddressInput(currentAddress || order.address);
                          setIsEditingAddress(false);
                        }}
                      >
                        <Text style={styles.cancelAddressBtnText}>Batal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveAddressBtn}
                        onPress={handleSaveAddress}
                      >
                        <Text style={styles.saveAddressBtnText}>Simpan Alamat Baru</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <Text style={styles.dateLine}>Tanggal Transaksi: {order.date}</Text>
              </View>
            </View>

            {/* Products List Card */}
            <View style={styles.cardContainer}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="bag-handle-outline" size={20} color="#0284C7" />
                <Text style={styles.cardHeaderTitle}>Daftar Produk ({items.length})</Text>
              </View>

              <View style={styles.itemsList}>
                {items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                    <View style={styles.itemTextGroup}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.variant && (
                        <Text style={styles.itemVariant}>Varian: {item.variant}</Text>
                      )}
                      <View style={styles.itemPriceQtyRow}>
                        <Text style={styles.itemPrice}>{formatRupiah(item.price)}</Text>
                        <Text style={styles.itemQty}>x{item.quantity}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Payment Summary breakdown */}
            <View style={styles.cardContainer}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="receipt-outline" size={20} color="#16A34A" />
                <Text style={styles.cardHeaderTitle}>Rincian Pembayaran</Text>
              </View>

              <View style={styles.summaryBody}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal Produk</Text>
                  <Text style={styles.summaryValue}>
                    {formatRupiah(order.productTotal || productSubtotal)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Ongkos Kirim</Text>
                  <Text style={styles.summaryValue}>
                    {order.type === 'pickup' ? 'Gratis' : formatRupiah(order.shippingFee || 0)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Diskon Voucher</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      order.discount > 0 && { color: '#D91E28', fontWeight: '800' },
                    ]}
                  >
                    {order.discount > 0 ? `- ${formatRupiah(order.discount)}` : 'Rp 0'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Metode Pembayaran</Text>
                  <Text style={[styles.summaryValue, { color: '#0284C7', fontWeight: '700' }]}>
                    {order.catatanPesanan || 'Midtrans Payment Gateway'}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Pembayaran</Text>
                  <Text style={styles.totalValue}>{formatRupiah(order.totalAmount)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Footer */}
          {(canCancel || isCompleted) && (
            <View style={styles.bottomFooter}>
              {canCancel && (
                <TouchableOpacity
                  style={styles.cancelFooterBtn}
                  onPress={() => {
                    if (onCancelOrder) onCancelOrder(order);
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                  <Text style={styles.cancelFooterText}>Batalkan Pesanan Ini</Text>
                </TouchableOpacity>
              )}

              {isCompleted && (
                <TouchableOpacity
                  style={styles.reorderFooterBtn}
                  onPress={() => {
                    onClose();
                    if (onReorder) onReorder(order);
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="repeat" size={18} color={COLORS.white} />
                  <Text style={styles.reorderFooterText}>Beli Lagi Produk Ini</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
    width: 620,
    maxHeight: '88%',
    backgroundColor: '#F8FAFC',
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
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 80,
  },
  statusBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  statusBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusBannerSub: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  payNowBtn: {
    backgroundColor: '#D91E28',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#D91E28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  payNowBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  cardContent: {
    padding: 14,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '800',
  },
  courierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  addressLine: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 19,
  },
  dateLine: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  itemsList: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  itemTextGroup: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  itemVariant: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 4,
  },
  itemPriceQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D91E28',
  },
  itemQty: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryBody: {
    padding: 14,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D91E28',
  },
  cancelFooterBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 10,
    height: 46,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cancelFooterText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '800',
  },
  bottomFooter: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  reorderFooterBtn: {
    backgroundColor: '#005691',
    borderRadius: 10,
    height: 46,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  reorderFooterText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  editAddrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  editAddrBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  editAddressFormBox: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editAddressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  editAddressTextInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editAddressBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  cancelAddressBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  cancelAddressBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  saveAddressBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#0284C7',
  },
  saveAddressBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
