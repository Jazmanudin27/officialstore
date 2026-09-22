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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';
import AddressModal from './AddressModal';
import VoucherScreen from './VoucherScreen';

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
}) {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [internalVoucher, setInternalVoucher] = useState(selectedVoucher);

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
      name: 'Ultra Milk Susu UHT Coklat Kotak 250 ml',
      price: 8400,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
    },
    {
      id: 'c3',
      name: 'Bimoli Minyak Goreng Pouch 2 L',
      price: 42800,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    },
  ];

  const displayItems = cartItems.length > 0 ? cartItems : defaultItems;
  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const voucherDiscount = activeVoucher ? activeVoucher.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - voucherDiscount);

  const totalItemCount = displayItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePilihPembayaran = () => {
    Alert.alert(
      '💳 Pilih Metode Pembayaran',
      `Total Pembayaran: ${formatRupiah(finalTotal)}\n\nSilakan pilih pembayaran:`,
      [
        {
          text: 'BCA Virtual Account',
          onPress: () => processPayment('BCA Virtual Account'),
        },
        {
          text: 'GoPay / QRIS',
          onPress: () => processPayment('GoPay'),
        },
        {
          text: 'COD (Bayar di Tempat)',
          onPress: () => processPayment('COD'),
        },
        {
          text: 'Batal',
          style: 'cancel',
        },
      ]
    );
  };

  const processPayment = (method) => {
    Alert.alert(
      '🎉 Pesanan Berhasil!',
      `Terima kasih! Pesanan Anda telah diproses menggunakan ${method}.\nTotal: ${formatRupiah(
        finalTotal
      )}`,
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
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
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
            <Ionicons name="flash" size={20} color="#D91E28" />
            <Text style={styles.deliveryTypeTitle}>Pengiriman Instan</Text>
          </View>

          {/* Estimasi Sampai Card */}
          <View style={styles.estimasiCard}>
            <View style={styles.estimasiLeft}>
              <View style={styles.motorIconBox}>
                <Ionicons name="bicycle" size={26} color="#D91E28" />
              </View>
              <View style={styles.estimasiTextGroup}>
                <Text style={styles.estimasiTitle}>
                  Estimasi sampai: <Text style={{ fontWeight: '700' }}>Maks. Selasa, 22 Sep</Text>
                </Text>
                <Text style={styles.aturJamText}>Atur jam pengiriman</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.aturBtn} activeOpacity={0.7}>
              <Text style={styles.aturBtnText}>Atur</Text>
            </TouchableOpacity>
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
                <Text style={styles.summaryLabel}>Total Ongkos Kirim</Text>
                <Ionicons name="information-circle-outline" size={15} color="#64748B" />
              </View>
              <View style={styles.ongkirRow}>
                <Text style={styles.ongkirStrike}>Rp 10.000</Text>
                <Text style={styles.summaryValue}>Rp 0</Text>
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

          {/* Delivery Address Card */}
          <TouchableOpacity
            style={styles.addressCardContainer}
            onPress={() => setIsAddressModalOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.addressHeaderRow}>
              <View style={styles.addressHeaderLeft}>
                <Ionicons name="bicycle" size={20} color="#D91E28" />
                <Text style={styles.addressHeaderTitle}>Kirim ke Alamat</Text>
                {selectedAddress?.isUtama && (
                  <View style={styles.utamaRedBadge}>
                    <Text style={styles.utamaRedBadgeText}>Utama</Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.gantiAlamatText}>Ganti Alamat</Text>
              </View>
            </View>

            <View style={styles.addressCardBody}>
              <View style={styles.addressInfoBox}>
                <View style={styles.addressBodyTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipientTitle}>
                      {selectedAddress?.title || 'Rumah'} - {selectedAddress?.recipient || 'Ade Fitri Nuraeni'}
                    </Text>
                    <Text style={styles.recipientAddress} numberOfLines={1}>
                      {selectedAddress?.addressLine1 || 'Jl. Pasir Bokor, Kp. Gunung Jambe, RT/R...'}
                    </Text>
                    {selectedAddress?.note ? (
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

                {/* Lobby Notice */}
                <View style={styles.lobbyNoticeBox}>
                  <Ionicons name="information-circle" size={16} color="#0284C7" style={{ marginTop: 1 }} />
                  <Text style={styles.lobbyNoticeText}>
                    Khusus gedung, mal, apartemen, kos & area terlarang,{' '}
                    <Text style={{ fontWeight: '800' }}>
                      pengantaran hanya sampai lobby/pos penjagaan.
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Warning Location Text */}
          <Text style={styles.warningLocationText}>
            Alamat terdeteksi jauh dari lokasi saat ini. Pastikan alamat pengiriman sudah sesuai
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
      </SafeAreaView>
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
  /* Estimasi Card */
  estimasiCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  estimasiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  motorIconBox: {
    marginRight: 10,
  },
  estimasiTextGroup: {
    flex: 1,
  },
  estimasiTitle: {
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  aturJamText: {
    fontSize: 12,
    color: '#D91E28',
    fontWeight: '700',
  },
  aturBtn: {
    borderWidth: 1.5,
    borderColor: '#0284C7',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  aturBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
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
});
