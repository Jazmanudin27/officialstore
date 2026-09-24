import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';

// Categorized PPOB Services (Alfagift Style)
export const PPOB_CATEGORIES = [
  {
    category: 'Isi Ulang',
    services: [
      { id: 'pulsa', title: 'Pulsa', icon: 'phone-portrait', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'prabayar' },
      { id: 'paket_data', title: 'Paket Data', icon: 'wifi', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'prabayar' },
      { id: 'roaming', title: 'Roaming', icon: 'globe-outline', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: 'Baru', type: 'prabayar' },
      { id: 'token_pln', title: 'PLN', icon: 'bulb', iconColor: '#F59E0B', bgColor: '#FEF3C7', badge: null, type: 'prabayar' },
      { id: 'topup_ewallet', title: 'Top Up\nE-Wallet', icon: 'wallet', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'prabayar' },
      { id: 'tukar_pulsa', title: 'Tukar Pulsa &\nPaket Data', icon: 'swap-horizontal', iconColor: '#0284C7', bgColor: '#E0F2FE', badge: null, type: 'prabayar' },
    ],
  },
  {
    category: 'Tagihan',
    services: [
      { id: 'pdam', title: 'Tagihan Air\nPDAM', icon: 'water', iconColor: '#0284C7', bgColor: '#E0F2FE', badge: null, type: 'pascabayar' },
      { id: 'bpjs', title: 'BPJS', icon: 'medkit', iconColor: '#16A34A', bgColor: '#DCFCE7', badge: null, type: 'pascabayar' },
      { id: 'tv_internet', title: 'TV Kabel &\nInternet', icon: 'tv', iconColor: '#0284C7', bgColor: '#E0F2FE', badge: null, type: 'pascabayar' },
      { id: 'hp_pascabayar', title: 'Tagihan\nPascabayar', icon: 'phone-portrait-outline', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'pascabayar' },
      { id: 'multifinance', title: 'Multifinance', icon: 'card', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'pascabayar' },
      { id: 'pbb', title: 'PBB', icon: 'home', iconColor: '#EA580C', bgColor: '#FFEDD5', badge: null, type: 'pascabayar' },
      { id: 'pgn', title: 'Tagihan PGN', icon: 'flame', iconColor: '#0284C7', bgColor: '#E0F2FE', badge: 'Baru', type: 'pascabayar' },
    ],
  },
  {
    category: 'Layanan lain',
    services: [
      { id: 'esim', title: 'e-SIM', icon: 'hardware-chip-outline', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'prabayar' },
      { id: 'gift_card', title: 'Gift Card', icon: 'gift', iconColor: '#F59E0B', bgColor: '#FEF3C7', badge: null, type: 'prabayar' },
      { id: 'mypertamina', title: 'Voucher\nMyPertamina', icon: 'speedometer', iconColor: '#0284C7', bgColor: '#E0F2FE', badge: 'Baru', type: 'prabayar' },
      { id: 'google_play', title: 'Google Play', icon: 'logo-google-playstore', iconColor: '#34A853', bgColor: '#E6F4EA', badge: null, type: 'prabayar' },
    ],
  },
];

// Flat list for main grid display
const MAIN_GRID_SERVICES = [
  { id: 'pulsa', title: 'Pulsa', icon: 'phone-portrait', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'prabayar' },
  { id: 'paket_data', title: 'Paket Data', icon: 'wifi', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'prabayar' },
  { id: 'pgn', title: 'Tagihan PGN', icon: 'flame', iconColor: '#0284C7', bgColor: '#E0F2FE', badge: 'Baru', type: 'pascabayar' },
  { id: 'pdam', title: 'Tagihan Air\nPDAM', icon: 'water', iconColor: '#0284C7', bgColor: '#E0F2FE', badge: null, type: 'pascabayar' },
  { id: 'token_pln', title: 'PLN', icon: 'bulb', iconColor: '#F59E0B', bgColor: '#FEF3C7', badge: null, type: 'prabayar' },
  { id: 'bpjs', title: 'BPJS', icon: 'medkit', iconColor: '#16A34A', bgColor: '#DCFCE7', badge: null, type: 'pascabayar' },
  { id: 'topup_ewallet', title: 'Top Up\nE-Wallet', icon: 'wallet', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'prabayar' },
  { id: 'tv_internet', title: 'TV Kabel &\nInternet', icon: 'tv', iconColor: '#0284C7', bgColor: '#E0F2FE', badge: null, type: 'pascabayar' },
  { id: 'esim', title: 'e-SIM', icon: 'hardware-chip-outline', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'prabayar' },
  { id: 'gift_card', title: 'Gift Card', icon: 'gift', iconColor: '#F59E0B', bgColor: '#FEF3C7', badge: null, type: 'prabayar' },
  { id: 'hp_pascabayar', title: 'Tagihan\nPascabayar', icon: 'phone-portrait-outline', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'pascabayar' },
  { id: 'multifinance', title: 'Multifinance', icon: 'card', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: null, type: 'pascabayar' },
  { id: 'pbb', title: 'PBB', icon: 'home', iconColor: '#EA580C', bgColor: '#FFEDD5', badge: null, type: 'pascabayar' },
  { id: 'mypertamina', title: 'Voucher\nMyPertamina', icon: 'speedometer', iconColor: '#0284C7', bgColor: '#E0F2FE', badge: 'Baru', type: 'prabayar' },
  { id: 'roaming', title: 'Roaming', icon: 'globe-outline', iconColor: '#EF4444', bgColor: '#FEF2F2', badge: 'Baru', type: 'prabayar' },
  { id: 'semua_menu', title: 'Semua Menu', icon: 'grid', iconColor: '#0284C7', bgColor: '#E0F2FE', badge: null, isMoreBtn: true },
];

// Sample Nominal Options for Demo
const NOMINAL_OPTIONS = {
  pulsa: [
    { id: 'p5', name: 'Pulsa 5.000', price: 6250 },
    { id: 'p10', name: 'Pulsa 10.000', price: 11250 },
    { id: 'p15', name: 'Pulsa 15.000', price: 16100 },
    { id: 'p20', name: 'Pulsa 20.000', price: 20900 },
    { id: 'p25', name: 'Pulsa 25.000', price: 25800 },
    { id: 'p50', name: 'Pulsa 50.000', price: 50500 },
    { id: 'p100', name: 'Pulsa 100.000', price: 99500 },
  ],
  paket_data: [
    { id: 'd1', name: 'Freedom 7GB / 28 Hari', price: 33900 },
    { id: 'd2', name: 'Freedom 18GB / 28 Hari', price: 55000 },
    { id: 'd3', name: 'Freedom 35GB / 28 Hari', price: 77600 },
    { id: 'd4', name: 'Freedom 55GB / 28 Hari', price: 97300 },
  ],
  token_pln: [
    { id: 'pln20', name: 'Token PLN 20.000', price: 21500 },
    { id: 'pln50', name: 'Token PLN 50.000', price: 51500 },
    { id: 'pln100', name: 'Token PLN 100.000', price: 101500 },
    { id: 'pln200', name: 'Token PLN 200.000', price: 201500 },
  ],
  topup_ewallet: [
    { id: 'ew1', name: 'Saldo DANA 20.000', price: 21000 },
    { id: 'ew2', name: 'Saldo GoPay 50.000', price: 51000 },
    { id: 'ew3', name: 'Saldo OVO 50.000', price: 51000 },
    { id: 'ew4', name: 'Saldo ShopeePay 100.000', price: 101000 },
  ],
};

export default function PpobModal({ visible, onClose, onAddToCart, user }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeService, setActiveService] = useState(null);
  const [showSemuaMenuSheet, setShowSemuaMenuSheet] = useState(false);

  const [customerNumber, setCustomerNumber] = useState('');
  const [selectedNominal, setSelectedNominal] = useState(null);
  const [isCheckingBill, setIsCheckingBill] = useState(false);
  const [billResult, setBillResult] = useState(null);

  if (!visible) return null;

  const handleSelectService = (service) => {
    if (service.isMoreBtn) {
      setShowSemuaMenuSheet(true);
      return;
    }
    setActiveService(service);
    setShowSemuaMenuSheet(false);
    setCustomerNumber('');
    setSelectedNominal(null);
    setBillResult(null);
  };

  const handleCheckBill = async () => {
    if (!customerNumber.trim()) {
      Alert.alert('Perhatian', 'Harap masukkan Nomor Pelanggan / ID.');
      return;
    }
    setIsCheckingBill(true);
    try {
      const response = await fetch('/api/ppob/check-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerSkuCode: activeService?.id || 'hpindosat',
          customerNumber: customerNumber.trim(),
        }),
      });
      const resData = await response.json();
      setIsCheckingBill(false);
      if (resData.status === 'success' || resData.data) {
        const item = resData.data || {};
        setBillResult({
          namaPelanggan: item.customer_name || item.namaPelanggan || 'Pelanggan Resmi Official Store',
          periode: item.periode || 'September 2026',
          tagihan: item.price || item.tagihan || 148500,
          biayaAdmin: item.admin || item.biayaAdmin || 2500,
          totalBayar: item.selling_price || item.totalBayar || 151000,
          refId: item.ref_id,
        });
      } else {
        Alert.alert('Gagal Cek Tagihan', resData.message || 'Nomor pelanggan tidak ditemukan.');
      }
    } catch (err) {
      setIsCheckingBill(false);
      // Fallback untuk offline/demo
      setBillResult({
        namaPelanggan: 'Pelanggan Resmi Official Store',
        periode: 'September 2026',
        tagihan: 148500,
        biayaAdmin: 2500,
        totalBayar: 151000,
      });
    }
  };

  const handleProcessTransaction = () => {
    if (!customerNumber.trim()) {
      Alert.alert('Perhatian', 'Harap masukkan Nomor HP / ID Pelanggan.');
      return;
    }

    if (activeService.type === 'prabayar' && !selectedNominal) {
      Alert.alert('Perhatian', 'Pilih nominal produk / paket yang ingin dibeli.');
      return;
    }

    const itemPrice = activeService.type === 'prabayar' ? selectedNominal.price : billResult.totalBayar;
    const itemName = activeService.type === 'prabayar'
      ? `${activeService.title} - ${selectedNominal.name} (${customerNumber})`
      : `${activeService.title} - ${billResult.namaPelanggan} (${customerNumber})`;

    const cartProduct = {
      id: `ppob-${Date.now()}`,
      name: itemName,
      price: itemPrice,
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300&q=80',
      category: 'DigiFlazz PPOB',
      isPpob: true,
      ppobData: {
        serviceId: activeService.id,
        customerNumber,
        nominal: selectedNominal,
        billResult,
      },
    };

    if (onAddToCart) {
      onAddToCart(cartProduct);
      Alert.alert('Berhasil! 🎉', 'Produk Digital berhasil dimasukkan ke keranjang belanja.', [
        {
          text: 'OK',
          onPress: () => {
            setActiveService(null);
            onClose();
          },
        },
      ]);
    }
  };

  const filteredMainServices = MAIN_GRID_SERVICES.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, isDesktop && styles.desktopModalContainer]}>
          
          {/* Header Bar Alfagift Style */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={onClose} style={styles.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>

            <View style={styles.searchBarBox}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari di Top Up & Tagihan"
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Form View / Grid View / Semua Menu View */}
          {activeService ? (
            /* ======================================= */
            /* VIEW 1: FORM TRANSAKSI SERVIS           */
            /* ======================================= */
            <ScrollView style={styles.bodyScrollView} contentContainerStyle={{ padding: 16 }}>
              <TouchableOpacity
                onPress={() => setActiveService(null)}
                style={styles.backLinkRow}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={16} color="#0284C7" />
                <Text style={styles.backLinkText}>Kembali ke Menu Utama</Text>
              </TouchableOpacity>

              <View style={[styles.activeServiceCard, { backgroundColor: activeService.bgColor }]}>
                <View style={[styles.activeIconCircle, { backgroundColor: activeService.iconColor }]}>
                  <Ionicons name={activeService.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.activeServiceTitle}>{activeService.title.replace('\n', ' ')}</Text>
                  <Text style={styles.activeServiceSub}>Isi ulang & bayar instan 24 jam</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {activeService.id.includes('pln') ? 'Nomor Meter / ID Pelanggan PLN' : 'Nomor HP / ID Pelanggan:'}
                </Text>
                <View style={styles.inputBox}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Contoh: 081234567890 / 1402839281"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    value={customerNumber}
                    onChangeText={setCustomerNumber}
                  />
                </View>
              </View>

              {activeService.type === 'prabayar' ? (
                <View style={styles.nominalSection}>
                  <Text style={styles.inputLabel}>Pilih Nominal / Paket:</Text>
                  <View style={styles.nominalGrid}>
                    {(NOMINAL_OPTIONS[activeService.id] || NOMINAL_OPTIONS['pulsa']).map((nom) => {
                      const isSelected = selectedNominal?.id === nom.id;
                      return (
                        <TouchableOpacity
                          key={nom.id}
                          style={[styles.nominalCard, isSelected && styles.nominalCardSelected]}
                          onPress={() => setSelectedNominal(nom)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.nominalName, isSelected && styles.nominalTextSelected]}>
                            {nom.name}
                          </Text>
                          <Text style={[styles.nominalPrice, isSelected && styles.nominalPriceSelected]}>
                            {formatRupiah(nom.price)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {selectedNominal && (
                    <View style={styles.summaryBox}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Harga Produk:</Text>
                        <Text style={styles.summaryValue}>{formatRupiah(selectedNominal.price)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Biaya Layanan:</Text>
                        <Text style={[styles.summaryValue, { color: '#16A34A' }]}>GRATIS</Text>
                      </View>
                      <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                        <Text style={styles.summaryTotalLabel}>Total Bayar:</Text>
                        <Text style={styles.summaryTotalValue}>{formatRupiah(selectedNominal.price)}</Text>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.submitBtn, (!customerNumber || !selectedNominal) && styles.submitBtnDisabled]}
                    onPress={handleProcessTransaction}
                    disabled={!customerNumber || !selectedNominal}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="cart" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitBtnText}>+ Masukkan ke Keranjang Belanja</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pascabayarSection}>
                  {!billResult ? (
                    <TouchableOpacity
                      style={[styles.submitBtn, !customerNumber && styles.submitBtnDisabled]}
                      onPress={handleCheckBill}
                      disabled={!customerNumber || isCheckingBill}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="search" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>
                        {isCheckingBill ? 'Memeriksa Tagihan...' : 'Cek Tagihan Sekarang'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.billResultBox}>
                      <Text style={styles.billResultTitle}>Rincian Tagihan Ditemukan!</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Nama Pelanggan:</Text>
                        <Text style={styles.summaryValue}>{billResult.namaPelanggan}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Periode Tagihan:</Text>
                        <Text style={styles.summaryValue}>{billResult.periode}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tagihan Bulanan:</Text>
                        <Text style={styles.summaryValue}>{formatRupiah(billResult.tagihan)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Biaya Admin:</Text>
                        <Text style={styles.summaryValue}>{formatRupiah(billResult.biayaAdmin)}</Text>
                      </View>
                      <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                        <Text style={styles.summaryTotalLabel}>Total Bayar:</Text>
                        <Text style={styles.summaryTotalValue}>{formatRupiah(billResult.totalBayar)}</Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.submitBtn, { marginTop: 16 }]}
                        onPress={handleProcessTransaction}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="bag-handle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.submitBtnText}>Bayar Tagihan Sekarang</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          ) : showSemuaMenuSheet ? (
            /* ======================================= */
            /* VIEW 2: BOTTOM SHEET "SEMUA MENU"       */
            /* ======================================= */
            <ScrollView style={styles.bodyScrollView} contentContainerStyle={{ padding: 16 }}>
              <TouchableOpacity
                onPress={() => setShowSemuaMenuSheet(false)}
                style={styles.backLinkRow}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={16} color="#0284C7" />
                <Text style={styles.backLinkText}>Kembali</Text>
              </TouchableOpacity>

              <Text style={styles.sheetTitle}>Semua Menu</Text>

              {PPOB_CATEGORIES.map((catGroup) => (
                <View key={catGroup.category} style={styles.categoryGroupBlock}>
                  <Text style={styles.categoryGroupTitle}>{catGroup.category}</Text>
                  <View style={styles.fourColumnGrid}>
                    {catGroup.services.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.gridCardItem}
                        onPress={() => handleSelectService(item)}
                        activeOpacity={0.75}
                      >
                        <View style={styles.iconWrapperBox}>
                          <View style={[styles.serviceIconSquare, { backgroundColor: item.bgColor }]}>
                            <Ionicons name={item.icon} size={22} color={item.iconColor} />
                          </View>
                          {item.badge && (
                            <View style={styles.purpleBadgePill}>
                              <Text style={styles.purpleBadgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.gridCardTitle}>{item.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            /* ======================================= */
            /* VIEW 3: UTAMA (ALFAGIFT STYLE GRID)     */
            /* ======================================= */
            <ScrollView style={styles.bodyScrollView} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* Promo Slogan Banner */}
              <View style={styles.promoHeaderCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoHeaderTitle}>Semua Bisa di Official Store</Text>
                  <Text style={styles.promoHeaderSub}>
                    Beli pulsa, paket data, token listrik, hingga bayar tagihan cepat & murah
                  </Text>
                </View>
                <Ionicons name="flash-sharp" size={32} color="#EF4444" />
              </View>

              {/* Promo Carousel Card Item */}
              <View style={styles.promoCardItem}>
                <View style={styles.promoTagHeader}>
                  <Text style={styles.promoTagTitle}>FREEDOM INTERNET PROMO</Text>
                </View>
                <View style={styles.promoPriceGrid}>
                  <View style={styles.promoPriceItem}>
                    <Text style={styles.promoGbText}>7 GB</Text>
                    <Text style={styles.promoDiscPrice}>Rp 33.900</Text>
                  </View>
                  <View style={styles.promoPriceItem}>
                    <Text style={styles.promoGbText}>18 GB</Text>
                    <Text style={styles.promoDiscPrice}>Rp 55.000</Text>
                  </View>
                  <View style={styles.promoPriceItem}>
                    <Text style={styles.promoGbText}>35 GB</Text>
                    <Text style={styles.promoDiscPrice}>Rp 77.600</Text>
                  </View>
                  <View style={styles.promoPriceItem}>
                    <Text style={styles.promoGbText}>55 GB</Text>
                    <Text style={styles.promoDiscPrice}>Rp 97.300</Text>
                  </View>
                </View>
              </View>

              {/* 4-Column Grid Services */}
              <View style={styles.fourColumnGridMain}>
                {filteredMainServices.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.gridCardItemMain}
                    onPress={() => handleSelectService(item)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.iconWrapperBox}>
                      <View style={[styles.serviceIconSquare, { backgroundColor: item.bgColor }]}>
                        <Ionicons name={item.icon} size={24} color={item.iconColor} />
                      </View>
                      {item.badge && (
                        <View style={styles.purpleBadgePill}>
                          <Text style={styles.purpleBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.gridCardTitle}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '92%',
    height: 720,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  desktopModalContainer: {
    maxWidth: 520,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  headerBackBtn: {
    padding: 4,
  },
  searchBarBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  bodyScrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  promoHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF5F5',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
  },
  promoHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  promoHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  promoCardItem: {
    backgroundColor: '#FEF08A',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  promoTagHeader: {
    marginBottom: 8,
  },
  promoTagTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#92400E',
  },
  promoPriceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promoPriceItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  promoGbText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  promoDiscPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D91E28',
    marginTop: 2,
  },
  fourColumnGridMain: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  gridCardItemMain: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  gridCardItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  iconWrapperBox: {
    position: 'relative',
    marginBottom: 6,
  },
  serviceIconSquare: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purpleBadgePill: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  purpleBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  gridCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    marginTop: 4,
  },
  categoryGroupBlock: {
    marginBottom: 20,
  },
  categoryGroupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  fourColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  backLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  backLinkText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 13,
  },
  activeServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  activeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeServiceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  activeServiceSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#F8FAFC',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  nominalSection: {
    marginTop: 4,
  },
  nominalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  nominalCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  nominalCardSelected: {
    borderColor: '#D91E28',
    backgroundColor: '#FEF2F2',
  },
  nominalName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  nominalTextSelected: {
    color: '#D91E28',
  },
  nominalPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
    marginTop: 6,
  },
  nominalPriceSelected: {
    color: '#D91E28',
  },
  summaryBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D91E28',
  },
  submitBtn: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#D91E28',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pascabayarSection: {
    marginTop: 4,
  },
  billResultBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 8,
  },
  billResultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 8,
  },
});
