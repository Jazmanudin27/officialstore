import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';
import apiService from '../services/api';

const PAYMENT_METHODS = [
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    type: 'midtrans',
    enabledPayments: ['bca_va'],
    icon: 'card-outline',
    iconColor: '#005691',
    badge: 'BCA',
  },
  {
    id: 'mandiri_va',
    name: 'Mandiri Virtual Account',
    type: 'midtrans',
    enabledPayments: ['echannel'],
    icon: 'card-outline',
    iconColor: '#003D79',
    badge: 'Mandiri',
  },
  {
    id: 'bank_transfer',
    name: 'Transfer Bank Lainnya (BRI, BNI, Permata)',
    type: 'midtrans',
    enabledPayments: ['bca_va', 'bni_va', 'bri_va', 'permata_va', 'other_va'],
    icon: 'business-outline',
    iconColor: '#0284C7',
    badge: 'Bank',
  },
  {
    id: 'qris',
    name: 'QRIS / E-Wallet (GoPay, ShopeePay, DANA)',
    type: 'midtrans',
    enabledPayments: ['gopay', 'shopeepay', 'qris'],
    icon: 'qr-code-outline',
    iconColor: '#16A34A',
    badge: 'QRIS',
  },
  {
    id: 'credit_card',
    name: 'Credit Card / Debit Online',
    type: 'midtrans',
    enabledPayments: ['credit_card'],
    icon: 'card-outline',
    iconColor: '#EAB308',
    badge: 'Kartu',
  },
  {
    id: 'cod',
    name: 'COD (Bayar di Tempat)',
    type: 'cod',
    icon: 'cash-outline',
    iconColor: '#16A34A',
    badge: 'COD',
  },
];

export default function PaymentScreen({
  visible,
  onClose,
  finalTotal = 0,
  subtotal = 0,
  deliveryFee = 0,
  discountAmount = 0,
  selectedAddress,
  cartItems = [],
  onCompleteCheckout,
  user,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [selectedMethodId, setSelectedMethodId] = useState('bca_va');
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const selectedMethodObj =
    PAYMENT_METHODS.find((m) => m.id === selectedMethodId) || PAYMENT_METHODS[0];

  const handleProcessPayment = async () => {
    if (selectedMethodObj.type === 'midtrans') {
      await processMidtransPayment();
    } else {
      processCodPayment();
    }
  };

  const processMidtransPayment = async () => {
    setIsLoadingPayment(true);
    const orderId = `INV-${Date.now().toString().slice(-8)}`;
    const customerName = selectedAddress
      ? selectedAddress.recipient || selectedAddress.nama_penerima || 'Pelanggan Official Store'
      : 'Pelanggan Official Store';
    const customerPhone = selectedAddress
      ? selectedAddress.phone || selectedAddress.nomor_telepon || '089523888200'
      : '089523888200';

    // 1. DAHULU SIMPAN PESANAN LANGSUNG KE DATABASE MYSQL
    try {
      await apiService.createOrder({
        nomorPesanan: orderId,
        userId: user?.id || 1,
        tipePesanan: selectedAddress?.isPickup ? 'pickup' : 'delivery',
        metodePembayaran: selectedMethodObj.name,
        statusPesanan: 'pending',
        status: 'menunggu',
        totalHargaProduk: subtotal,
        ongkosKirim: deliveryFee,
        diskonVoucher: discountAmount,
        totalPembayaran: finalTotal,
        catatanPesanan: `Midtrans Snap Order (${selectedMethodObj.name}) ${orderId}`,
        items: cartItems,
      });
    } catch (dbErr) {
      console.warn('Order save error:', dbErr.message);
    }

    try {
      // 2. KEMUDIAN BUAT SNAP TOKEN UNTUK MIDTRANS
      const snapRes = await apiService.createMidtransSnapToken({
        orderId,
        grossAmount: finalTotal,
        customerName,
        customerPhone,
        enabledPayments: selectedMethodObj.enabledPayments,
        items: cartItems.map((it) => ({
          id: it.id,
          price: it.price,
          quantity: it.quantity,
          name: it.name,
        })),
      });

      if (snapRes && snapRes.token) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const launchSnapModal = () => {
            if (window.snap) {
              window.snap.pay(snapRes.token, {
                onSuccess: (result) => {
                  finishOrder(`Midtrans (${selectedMethodObj.name})`);
                },
                onPending: (result) => {
                  finishOrder(`Midtrans (${selectedMethodObj.name} - Menunggu Pembayaran)`);
                },
                onError: (result) => {
                  finishOrder(`Midtrans (${selectedMethodObj.name} - Belum Bayar)`);
                },
                onClose: () => {
                  finishOrder(`Midtrans (${selectedMethodObj.name} - Belum Bayar)`);
                },
              });
            } else if (snapRes.redirectUrl) {
              window.open(snapRes.redirectUrl, '_blank');
              finishOrder(`Midtrans Redirect (${selectedMethodObj.name})`);
            }
          };

          if (!window.snap) {
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute(
              'data-client-key',
              snapRes.clientKey || 'SB-Mid-client-gtkZiSrCZjZHYwwZ'
            );
            script.onload = launchSnapModal;
            document.head.appendChild(script);
          } else {
            launchSnapModal();
          }
        } else if (snapRes.redirectUrl) {
          window.open(snapRes.redirectUrl, '_blank');
          finishOrder(`Midtrans Redirect (${selectedMethodObj.name})`);
        }
      } else {
        finishOrder(`Pesanan Dibuat (${selectedMethodObj.name})`);
      }
    } catch (err) {
      finishOrder(`Pesanan Dibuat (${selectedMethodObj.name})`);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const processCodPayment = async () => {
    setIsLoadingPayment(true);
    const orderId = `INV-${Date.now().toString().slice(-8)}`;
    try {
      await apiService.createOrder({
        nomorPesanan: orderId,
        userId: user?.id || 1,
        tipePesanan: selectedAddress?.isPickup ? 'pickup' : 'delivery',
        metodePembayaran: 'cod',
        statusPesanan: 'processing',
        status: 'diproses',
        totalHargaProduk: subtotal,
        ongkosKirim: deliveryFee,
        diskonVoucher: discountAmount,
        totalPembayaran: finalTotal,
        catatanPesanan: `COD (Bayar di Tempat)`,
        items: cartItems,
      });
    } catch (err) {
      console.warn('COD order save warning:', err);
    } finally {
      setIsLoadingPayment(false);
      finishOrder('COD (Bayar di Tempat)');
    }
  };

  const finishOrder = (method) => {
    const msg = `🎉 Pesanan Berhasil Diproses!\n\nTerima kasih! Pesanan Anda telah dibuat menggunakan ${method}.\nTotal Pembayaran: ${formatRupiah(finalTotal)}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(msg);
      if (onCompleteCheckout) onCompleteCheckout();
      onClose();
    } else {
      Alert.alert('🎉 Pesanan Berhasil Diproses!', msg, [
        {
          text: 'Selesai',
          onPress: () => {
            if (onCompleteCheckout) onCompleteCheckout();
            onClose();
          },
        },
      ]);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType={isDesktop ? 'fade' : 'slide'}
      transparent={isDesktop}
      onRequestClose={onClose}
    >
      <View style={isDesktop ? styles.desktopOverlay : { flex: 1 }}>
        <View style={isDesktop ? styles.desktopModalCard : styles.safeArea}>
          {/* Solid Red Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pembayaran</Text>
          </View>

          <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Payment Methods List */}
            <View style={styles.paymentMethodsCard}>
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethodId === method.id;

                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentRow,
                      isSelected && styles.paymentRowSelected,
                    ]}
                    onPress={() => setSelectedMethodId(method.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.paymentLeft}>
                      <View
                        style={[
                          styles.badgeLogoBox,
                          { backgroundColor: method.iconColor + '15' },
                        ]}
                      >
                        <Text style={[styles.badgeLogoText, { color: method.iconColor }]}>
                          {method.badge}
                        </Text>
                      </View>
                      <Text style={styles.paymentNameText}>{method.name}</Text>
                    </View>

                    {/* Radio Button matching the uploaded design screenshot */}
                    <View
                      style={[
                        styles.radioOuterCircle,
                        isSelected && styles.radioOuterCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Ringkasan Summary Card matching the uploaded design screenshot */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryHeaderTitle}>Ringkasan</Text>

              <Text style={styles.paymentNoticeText}>
                Pembayaran menggunakan{' '}
                <Text style={{ fontWeight: '800', color: '#D91E28' }}>
                  {selectedMethodObj.name}
                </Text>
              </Text>

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
                <Text
                  style={[
                    styles.summaryValue,
                    discountAmount > 0 && { color: '#D91E28', fontWeight: '800' },
                  ]}
                >
                  {discountAmount > 0 ? `- ${formatRupiah(discountAmount)}` : 'Rp 0'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Ongkos Kirim</Text>
                <Text style={styles.summaryValue}>
                  {selectedAddress?.isPickup ? 'Rp 0' : formatRupiah(deliveryFee)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Biaya Layanan</Text>
                <Text style={styles.summaryValue}>Rp 0</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>A-Poin</Text>
                <Text style={styles.summaryValue}>Rp 0</Text>
              </View>

              <View style={styles.solidDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Pembayaran</Text>
                <Text style={styles.totalValue}>{formatRupiah(finalTotal)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Solid Red BAYAR Action Button matching screenshot */}
          <View style={styles.bottomBarContainer}>
            <TouchableOpacity
              style={styles.bayarBtn}
              onPress={handleProcessPayment}
              activeOpacity={0.85}
              disabled={isLoadingPayment}
            >
              {isLoadingPayment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.bayarBtnText}>BAYAR</Text>
              )}
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
    gap: 14,
    paddingBottom: 90,
  },
  /* Payment List Card */
  paymentMethodsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentRowSelected: {
    backgroundColor: '#FEF2F2',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  badgeLogoBox: {
    width: 54,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  badgeLogoText: {
    fontSize: 11,
    fontWeight: '900',
  },
  paymentNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
  },
  radioOuterCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  radioOuterCircleSelected: {
    borderColor: '#D91E28',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D91E28',
  },
  /* Summary Card matching screenshot */
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  paymentNoticeText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
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
    fontWeight: '700',
    color: COLORS.textDark,
  },
  solidDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  /* Bottom Action Bar */
  bottomBarContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  bayarBtn: {
    backgroundColor: '#D91E28',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D91E28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bayarBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
