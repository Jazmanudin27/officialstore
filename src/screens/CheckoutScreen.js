import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';
import AddressModal from './AddressModal';
import VoucherScreen from './VoucherScreen';
import PaymentScreen from './PaymentScreen';
import apiService from '../services/api';

const COURIER_OPTIONS = [
  {
    id: 'instan',
    name: 'Pengiriman Instan',
    badge: 'Maks. 1-2 Jam',
    price: 12000,
    desc: 'Dikirim cepat oleh kurir toko / pengiriman instan',
    icon: 'flash',
    color: '#D91E28',
  },
  {
    id: 'jnt',
    name: 'J&T Express',
    badge: '1 - 2 Hari',
    price: 10000,
    desc: 'Pengiriman reguler cepat & terpercaya via J&T Express',
    icon: 'car-sport',
    color: '#0284C7',
  },
  {
    id: 'jne',
    name: 'JNE Reguler',
    badge: '2 - 3 Hari',
    price: 9000,
    desc: 'Pengiriman hemat & aman via JNE Express',
    icon: 'cube',
    color: '#16A34A',
  },
];

export default function CheckoutScreen({
  visible,
  onClose,
  cartItems = [],
  onCompleteCheckout,
  onOpenVoucher,
  onOpenAddress,
  selectedVoucher = null,
  selectedAddress,
  onSelectAddress,
  onSelectVoucher,
  user,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [internalVoucher, setInternalVoucher] = useState(selectedVoucher);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState('instan');

  React.useEffect(() => {
    setInternalVoucher(selectedVoucher);
  }, [selectedVoucher]);

  const activeVoucher = internalVoucher || selectedVoucher;

  const defaultItems = [
    {
      id: 'c1',
      name: 'Aqua Air Mineral Botol 600 ml',
      price: 4000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80',
    },
    {
      id: 'c2',
      name: 'Indomie Goreng Spesial 85 g',
      price: 3100,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    },
  ];

  const displayItems = cartItems.length > 0 ? cartItems : defaultItems;

  const totalProductPrice = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentCourier = COURIER_OPTIONS.find((c) => c.id === selectedCourier) || COURIER_OPTIONS[0];
  const deliveryFee = selectedAddress?.isPickup ? 0 : currentCourier.price;
  const totalItemCount = displayItems.reduce((sum, item) => sum + item.quantity, 0);

  const discountAmount = activeVoucher ? activeVoucher.discountAmount : 0;
  const finalTotal = Math.max(0, totalProductPrice + deliveryFee - discountAmount);

  const subtotal = totalProductPrice;
  const voucherDiscount = discountAmount;

  const handlePilihPembayaran = () => {
    setIsPaymentModalOpen(true);
  };

  const processMidtransPayment = async () => {
    setIsLoadingPayment(true);
    try {
      const orderId = `INV-${Date.now().toString().slice(-8)}`;
      const customerName = selectedAddress
        ? (selectedAddress.recipient || selectedAddress.nama_penerima || 'Pelanggan Official Store')
        : 'Pelanggan Official Store';
      const customerPhone = selectedAddress
        ? (selectedAddress.phone || selectedAddress.nomor_telepon || '089523888200')
        : '089523888200';

      const snapRes = await apiService.createMidtransSnapToken({
        orderId,
        grossAmount: finalTotal,
        customerName,
        customerPhone,
        items: displayItems.map((it) => ({
          id: it.id,
          price: it.price,
          quantity: it.quantity,
          name: it.name,
        })),
      });

      // Simpan pesanan ke database MySQL
      try {
        await apiService.createOrder({
          userId: 1,
          tipePesanan: selectedAddress?.isPickup ? 'pickup' : 'delivery',
          totalHargaProduk: totalProductPrice,
          ongkosKirim: deliveryFee,
          diskonVoucher: discountAmount,
          totalPembayaran: finalTotal,
          catatanPesanan: `Midtrans Snap Order ${orderId}`,
          items: displayItems,
        });
      } catch (dbErr) {
        console.warn('Order save error:', dbErr.message);
      }

      if (snapRes && snapRes.token) {
        // Trigger Snap Popup di browser web
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const launchSnapModal = () => {
            if (window.snap) {
              window.snap.pay(snapRes.token, {
                onSuccess: (result) => {
                  finishOrder('Midtrans (Pembayaran Berhasil)');
                },
                onPending: (result) => {
                  finishOrder('Midtrans (Menunggu Pembayaran)');
                },
                onError: (result) => {
                  Alert.alert('Pembayaran Gagal', 'Proses pembayaran Midtrans tidak berhasil.');
                },
                onClose: () => {
                  console.log('Snap popup closed by user');
                },
              });
            } else if (snapRes.redirectUrl) {
              window.open(snapRes.redirectUrl, '_blank');
              finishOrder('Midtrans Sandbox Redirect');
            }
          };

          if (!window.snap) {
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', snapRes.clientKey || 'SB-Mid-client-gtkZiSrCZjZHYwwZ');
            script.onload = launchSnapModal;
            document.head.appendChild(script);
          } else {
            launchSnapModal();
          }
        } else if (snapRes.redirectUrl) {
          window.open(snapRes.redirectUrl, '_blank');
          finishOrder('Midtrans Payment Redirect');
        }
      } else {
        throw new Error('Gagal mendapatkan token transaksi Midtrans.');
      }
    } catch (err) {
      Alert.alert('Midtrans Payment Info', err.message || 'Gagal memproses pembayaran Midtrans.');
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const finishOrder = (method) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`🎉 Pesanan Berhasil Diproses!\n\nTerima kasih! Pesanan Anda telah dibuat menggunakan ${method}.\nTotal Pembayaran: ${formatRupiah(finalTotal)}`);
      if (onCompleteCheckout) onCompleteCheckout();
      onClose();
    } else {
      Alert.alert(
        '🎉 Pesanan Berhasil Diproses!',
        `Terima kasih! Pesanan Anda telah dibuat menggunakan ${method}.\nTotal: ${formatRupiah(finalTotal)}`,
        [
          {
            text: 'Selesai',
            onPress: () => {
              if (onCompleteCheckout) onCompleteCheckout();
              onClose();
            },
          },
        ]
      );
    }
  };

  const processPayment = (method) => {
    finishOrder(method);
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
          {/* Top Solid Red Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ringkasan Pesanan</Text>
          </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Products Count Header */}
          <Text style={styles.productCountText}>{totalItemCount} Produk</Text>

          {/* Delivery Type Header */}
          <View style={styles.deliveryTypeRow}>
            <Ionicons name="car-sport" size={20} color="#D91E28" />
            <Text style={styles.deliveryTypeTitle}>Pilihan Kurir & Pengiriman</Text>
          </View>

          {/* Opsi Kurir Pengiriman Card (Instan, JNT, JNE) */}
          <View style={styles.courierCardContainer}>
            {COURIER_OPTIONS.map((courier) => {
              const isSelected = selectedCourier === courier.id;
              return (
                <TouchableOpacity
                  key={courier.id}
                  style={[
                    styles.courierItem,
                    isSelected && styles.courierItemSelected,
                  ]}
                  onPress={() => setSelectedCourier(courier.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.courierLeft}>
                    <View style={[styles.courierIconBox, { backgroundColor: courier.color + '18' }]}>
                      <Ionicons name={courier.icon} size={20} color={courier.color} />
                    </View>
                    <View style={styles.courierTextGroup}>
                      <View style={styles.courierTitleRow}>
                        <Text style={styles.courierName}>{courier.name}</Text>
                        <View style={[styles.courierBadge, { backgroundColor: courier.color + '20' }]}>
                          <Text style={[styles.courierBadgeText, { color: courier.color }]}>
                            {courier.badge}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.courierDesc}>{courier.desc}</Text>
                    </View>
                  </View>

                  <View style={styles.courierRight}>
                    <Text style={styles.courierPrice}>
                      {selectedAddress?.isPickup ? 'Gratis' : formatRupiah(courier.price)}
                    </Text>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Itemized Products List */}
          <View style={styles.productsListCard}>
            {displayItems.map((item) => (
              <View key={item.id} style={styles.productRowItem}>
                <Image source={{ uri: item.image }} style={styles.productThumb} />
                <Text style={styles.productNameText} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.productQtyText}>{item.quantity}x</Text>
                <Text style={styles.productPriceText}>{formatRupiah(item.price * item.quantity)}</Text>
              </View>
            ))}
          </View>

          {/* Section: Ringkasan Pesanan */}
          <Text style={styles.sectionHeaderTitle}>Ringkasan Pesanan</Text>

          {/* Reward A-Poin Card */}
          <TouchableOpacity style={styles.rewardCard} activeOpacity={0.7}>
            <View style={styles.rewardLeft}>
              <Text style={styles.rewardLabel}>Reward dari transaksi ini</Text>
              <View style={styles.poinRow}>
                <View style={styles.coinBadge}>
                  <Text style={styles.coinText}>A</Text>
                </View>
                <Text style={styles.poinValue}>55 A-Poin</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0284C7" />
          </TouchableOpacity>

          {/* Payment Summary White Box */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal Belanja</Text>
              <Text style={styles.summaryValue}>{formatRupiah(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Diskon</Text>
              <Text style={styles.summaryValue}>Rp 0</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Voucher</Text>
              <Text style={[styles.summaryValue, voucherDiscount > 0 && { color: '#D91E28', fontWeight: '800' }]}>
                {voucherDiscount > 0 ? `- ${formatRupiah(voucherDiscount)}` : 'Rp 0'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.labelWithInfo}>
                <Text style={styles.summaryLabel}>
                  Total Ongkos Kirim ({selectedAddress?.isPickup ? 'Pickup' : currentCourier.name})
                </Text>
                <Ionicons name="information-circle-outline" size={15} color="#64748B" />
              </View>
              <View style={styles.ongkirRow}>
                <Text style={styles.summaryValue}>
                  {selectedAddress?.isPickup ? 'Gratis (Rp 0)' : formatRupiah(deliveryFee)}
                </Text>
              </View>
            </View>

            <View style={styles.dashedDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalValue}>{formatRupiah(finalTotal)}</Text>
            </View>
          </View>

          {/* Voucher Section Card */}
          <View style={styles.voucherCardContainer}>
            <View style={styles.voucherHeader}>
              <Text style={styles.voucherHeaderTitle}>Pakai voucher lebih HEMAT!</Text>
            </View>
            <View style={styles.voucherBody}>
              <TouchableOpacity
                style={styles.voucherInputRow}
                onPress={() => setIsVoucherModalOpen(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="ticket-outline" size={22} color="#0284C7" />
                <Text style={styles.voucherInputText} numberOfLines={1}>
                  {activeVoucher ? activeVoucher.title : 'Pilih/masukkan kode vouchermu'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#0284C7" />
              </TouchableOpacity>
              <View style={styles.solidDivider} />
              <TouchableOpacity
                style={styles.lihatVoucherBtn}
                onPress={() => setIsVoucherModalOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.lihatVoucherText}>Lihat semua voucher</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery or Pickup Card */}
          <TouchableOpacity
            style={styles.addressCardContainer}
            onPress={() => setIsAddressModalOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.addressHeaderRow}>
              <View style={styles.addressHeaderLeft}>
                <Ionicons
                  name={selectedAddress?.isPickup ? 'storefront' : 'bicycle'}
                  size={20}
                  color="#D91E28"
                />
                <Text style={styles.addressHeaderTitle}>
                  {selectedAddress?.isPickup ? 'Ambil di Toko Cabang' : 'Kirim ke Alamat'}
                </Text>
                {selectedAddress?.isPickup ? (
                  <View style={[styles.utamaRedBadge, { backgroundColor: '#0284C7' }]}>
                    <Text style={styles.utamaRedBadgeText}>Pickup</Text>
                  </View>
                ) : (
                  selectedAddress?.isUtama && (
                    <View style={styles.utamaRedBadge}>
                      <Text style={styles.utamaRedBadgeText}>Utama</Text>
                    </View>
                  )
                )}
              </View>
              <View>
                <Text style={styles.gantiAlamatText}>
                  {selectedAddress?.isPickup ? 'Ganti Toko' : 'Ganti Alamat'}
                </Text>
              </View>
            </View>

            <View style={styles.addressCardBody}>
              <View style={styles.addressInfoBox}>
                <View style={styles.addressBodyTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipientTitle}>
                      {selectedAddress
                        ? selectedAddress.isPickup
                          ? selectedAddress.title
                          : `${selectedAddress.title || 'Rumah'} - ${selectedAddress.recipient || 'Pelanggan'}`
                        : 'Belum Ada Alamat Terpilih'}
                    </Text>
                    <Text style={styles.recipientAddress} numberOfLines={2}>
                      {selectedAddress
                        ? selectedAddress.addressLine1
                        : 'Silakan pilih atau tambahkan lokasi pengiriman.'}
                    </Text>
                    {selectedAddress?.isPickup ? (
                      <View style={styles.patokanRow}>
                        <Ionicons name="time-outline" size={13} color="#0284C7" />
                        <Text style={[styles.patokanText, { color: '#0284C7', fontWeight: '700' }]}>
                          {selectedAddress?.addressLine2 || 'Toko Buka • 07:00 - 22:00'}
                        </Text>
                      </View>
                    ) : selectedAddress?.note ? (
                      <View style={styles.patokanRow}>
                        <Ionicons name="document-text-outline" size={13} color="#64748B" />
                        <Text style={styles.patokanText}>{selectedAddress.note}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.detailBtn}>
                    <Text style={styles.detailBtnText}>Detail</Text>
                  </View>
                </View>

                {/* Pickup / Delivery Notice */}
                <View style={styles.lobbyNoticeBox}>
                  <Ionicons
                    name={selectedAddress?.isPickup ? 'storefront-outline' : 'information-circle'}
                    size={16}
                    color="#0284C7"
                    style={{ marginTop: 1 }}
                  />
                  <Text style={styles.lobbyNoticeText}>
                    {selectedAddress?.isPickup ? (
                      <>
                        Pesanan siap diambil di kasir{' '}
                        <Text style={{ fontWeight: '800' }}>{selectedAddress?.title || 'Toko Pilihan'}</Text>{' '}
                        setelah Anda menyelesaikan pembayaran.
                      </>
                    ) : (
                      <>
                        Khusus gedung, mal, apartemen, kos & area terlarang,{' '}
                        <Text style={{ fontWeight: '800' }}>
                          pengantaran hanya sampai lobby/pos penjagaan.
                        </Text>
                      </>
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Warning Location / Info Text */}
          <Text style={styles.warningLocationText}>
            {selectedAddress?.isPickup
              ? 'Toko terdekat otomatis dipilih berdasarkan estimasi jarak ke lokasimu.'
              : 'Alamat terdeteksi jauh dari lokasi saat ini. Pastikan alamat pengiriman sudah sesuai'}
          </Text>
        </ScrollView>

        {/* Sticky Bottom Action Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.pilihPembayaranBtn}
            onPress={handlePilihPembayaran}
            activeOpacity={0.85}
          >
            <Text style={styles.pilihPembayaranText}>Pilih Metode Pembayaran</Text>
          </TouchableOpacity>
        </View>

        {/* Address Selection Full Screen Overlay inside Checkout */}
        <AddressModal
          visible={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          selectedAddress={selectedAddress}
          onSelectAddress={(addr) => {
            setIsAddressModalOpen(false);
            if (onSelectAddress) onSelectAddress(addr);
          }}
          user={user}
        />

        {/* Voucher Selection Full Screen Overlay inside Checkout */}
        <VoucherScreen
          visible={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          onSelectVoucher={(v) => {
            setInternalVoucher(v);
            setIsVoucherModalOpen(false);
            if (onSelectVoucher) onSelectVoucher(v);
          }}
        />

        {/* Full Screen Dedicated Payment Screen matching user design */}
        <PaymentScreen
          visible={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          finalTotal={finalTotal}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          discountAmount={discountAmount}
          selectedAddress={selectedAddress}
          cartItems={displayItems}
          onCompleteCheckout={() => {
            setIsPaymentModalOpen(false);
            if (onCompleteCheckout) onCompleteCheckout();
            onClose();
          }}
        />
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
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginLeft: 12,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 90,
  },
  productCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  deliveryTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliveryTypeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  /* Courier Cards */
  courierCardContainer: {
    gap: 8,
  },
  courierItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  courierItemSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  courierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  courierIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  courierTextGroup: {
    flex: 1,
  },
  courierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  courierName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  courierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  courierBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  courierDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  courierRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  courierPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  radioCircleSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#0284C7',
  },
  /* Products List */
  productsListCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productThumb: {
    width: 42,
    height: 42,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#F1F5F9',
  },
  productNameText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '500',
    marginRight: 8,
  },
  productQtyText: {
    fontSize: 13,
    color: '#64748B',
    marginRight: 12,
  },
  productPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  /* Section Title */
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 6,
  },
  /* Reward Card */
  rewardCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rewardLeft: {
    gap: 4,
  },
  rewardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  poinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  poinValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  /* Summary Card */
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  ongkirRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ongkirStrike: {
    fontSize: 13,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  dashedDivider: {
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
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
  /* Voucher Card */
  voucherCardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    backgroundColor: COLORS.white,
  },
  voucherHeader: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  voucherHeaderTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  voucherBody: {
    padding: 14,
    gap: 12,
  },
  voucherInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voucherInputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  solidDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  lihatVoucherBtn: {
    alignItems: 'center',
  },
  lihatVoucherText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
  },
  /* Delivery Address Container */
  addressCardContainer: {
    backgroundColor: '#FEF9C3',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  addressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  utamaRedBadge: {
    backgroundColor: '#D91E28',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  utamaRedBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  gantiAlamatText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  addressCardBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  addressInfoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressBodyTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  recipientTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  recipientAddress: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  patokanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  patokanText: {
    fontSize: 11,
    color: '#64748B',
  },
  detailBtn: {
    borderWidth: 1.5,
    borderColor: '#0284C7',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  detailBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  lobbyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  lobbyNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
  },
  warningLocationText: {
    color: '#D91E28',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 14,
    lineHeight: 18,
  },
  /* Bottom Container */
  bottomContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pilihPembayaranBtn: {
    backgroundColor: '#005691',
    borderRadius: 10,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pilihPembayaranText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  /* Payment Modal Styles */
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  paymentModalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  paymentModalTotal: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  closePaymentBtn: {
    padding: 4,
  },
  paymentOptionsScroll: {
    gap: 12,
    paddingVertical: 14,
  },
  paymentOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentOptionTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  paymentTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  paymentOptionName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  autoBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  autoBadgeText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '800',
  },
  paymentOptionDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  /* Loading Overlay */
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },
});
