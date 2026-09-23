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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';
import { COLORS } from '../constants/theme';

export const PPOB_SERVICES = [
  {
    id: 'pulsa',
    title: 'Pulsa Reguler',
    icon: 'phone-portrait-outline',
    color: '#D91E28',
    bgColor: '#FEE2E2',
    type: 'prabayar',
    desc: 'Telkomsel, Indosat, XL, Tri, Smartfren, Axis',
  },
  {
    id: 'paket_data',
    title: 'Paket Data',
    icon: 'wifi-outline',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    type: 'prabayar',
    desc: 'Kuota Internet Harian, Mingguan & Bulanan',
  },
  {
    id: 'token_pln',
    title: 'Token PLN',
    icon: 'flash-outline',
    color: '#EAB308',
    bgColor: '#FEF9C3',
    type: 'prabayar',
    desc: 'Listrik Prabayar Rp 20rb - Rp 1 Juta',
  },
  {
    id: 'tagihan_pln',
    title: 'Tagihan PLN',
    icon: 'bulb-outline',
    color: '#CA8A04',
    bgColor: '#FEF08A',
    type: 'pascabayar',
    desc: 'Bayar Tagihan Listrik Bulanan PLN',
  },
  {
    id: 'tv_kabel',
    title: 'TV Berlangganan',
    icon: 'tv-outline',
    color: '#9333EA',
    bgColor: '#F3E8FF',
    type: 'pascabayar',
    desc: 'K-Vision, Nex Parabola, MNC Vision, Transvision',
  },
  {
    id: 'hp_pascabayar',
    title: 'HP Pascabayar',
    icon: 'call-outline',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    type: 'pascabayar',
    desc: 'Kartu Halo, XL Prioritas, Indosat Matrix',
  },
  {
    id: 'pdam',
    title: 'PDAM Air',
    icon: 'water-outline',
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    type: 'pascabayar',
    desc: 'Tagihan Air PDAM Kab/Kota Seluruh Indonesia',
  },
  {
    id: 'bpjs',
    title: 'BPJS Kesehatan',
    icon: 'medkit-outline',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    type: 'pascabayar',
    desc: 'Bayar Iuran BPJS Kesehatan Keluarga',
  },
  {
    id: 'internet',
    title: 'Internet & TV',
    icon: 'globe-outline',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    type: 'pascabayar',
    desc: 'IndiHome, Biznet, First Media, MyRepublic',
  },
  {
    id: 'voucher_game',
    title: 'Voucher Game',
    icon: 'game-controller-outline',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    type: 'prabayar',
    desc: 'Mobile Legends, Free Fire, PUBG, Roblox',
  },
  {
    id: 'voucher_digital',
    title: 'Voucher Digital',
    icon: 'card-outline',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    type: 'prabayar',
    desc: 'Google Play, Steam Wallet, Alfamart, Spotify',
  },
  {
    id: 'topup_ewallet',
    title: 'Top Up E-Wallet',
    icon: 'wallet-outline',
    color: '#059669',
    bgColor: '#D1FAE5',
    type: 'prabayar',
    desc: 'DANA, OVO, GoPay, ShopeePay, LinkAja',
  },
];

// Sample Nominal Options for Demo
const NOMINAL_OPTIONS = {
  pulsa: [
    { id: 'p5', name: 'Pulsa 5.000', price: 6250, admin: 0 },
    { id: 'p10', name: 'Pulsa 10.000', price: 11250, admin: 0 },
    { id: 'p15', name: 'Pulsa 15.000', price: 16100, admin: 0 },
    { id: 'p20', name: 'Pulsa 20.000', price: 20900, admin: 0 },
    { id: 'p25', name: 'Pulsa 25.000', price: 25800, admin: 0 },
    { id: 'p50', name: 'Pulsa 50.000', price: 50500, admin: 0 },
    { id: 'p100', name: 'Pulsa 100.000', price: 99500, admin: 0 },
  ],
  paket_data: [
    { id: 'd1', name: 'Freedom 3GB / 5 Hari', price: 15500, admin: 0 },
    { id: 'd2', name: 'Combo Sakti 10GB / 30 Hari', price: 42000, admin: 0 },
    { id: 'd3', name: 'Extra Unlimited 25GB', price: 78000, admin: 0 },
    { id: 'd4', name: 'Super Internet 50GB', price: 115000, admin: 0 },
  ],
  token_pln: [
    { id: 'pln20', name: 'Token PLN 20.000', price: 21500, admin: 0 },
    { id: 'pln50', name: 'Token PLN 50.000', price: 51500, admin: 0 },
    { id: 'pln100', name: 'Token PLN 100.000', price: 101500, admin: 0 },
    { id: 'pln200', name: 'Token PLN 200.000', price: 201500, admin: 0 },
    { id: 'pln500', name: 'Token PLN 500.000', price: 501500, admin: 0 },
  ],
  topup_ewallet: [
    { id: 'ew1', name: 'Saldo DANA 20.000', price: 21000, admin: 0 },
    { id: 'ew2', name: 'Saldo GoPay 50.000', price: 51000, admin: 0 },
    { id: 'ew3', name: 'Saldo OVO 50.000', price: 51000, admin: 0 },
    { id: 'ew4', name: 'Saldo ShopeePay 100.000', price: 101000, admin: 0 },
  ],
  voucher_game: [
    { id: 'g1', name: '86 Diamonds Mobile Legends', price: 22000, admin: 0 },
    { id: 'g2', name: '140 Diamonds Free Fire', price: 20000, admin: 0 },
    { id: 'g3', name: '60 UC PUBG Mobile', price: 16500, admin: 0 },
    { id: 'g4', name: '800 Robux Roblox', price: 145000, admin: 0 },
  ],
};

export default function PpobModal({ visible, onClose, onAddToCart, user }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : 2;

  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [activeService, setActiveService] = useState(null);
  const [customerNumber, setCustomerNumber] = useState('');
  const [selectedNominal, setSelectedNominal] = useState(null);
  const [isCheckingBill, setIsCheckingBill] = useState(false);
  const [billResult, setBillResult] = useState(null);

  if (!visible) return null;

  const filteredServices = PPOB_SERVICES.filter((item) => {
    if (selectedFilter === 'prabayar') return item.type === 'prabayar';
    if (selectedFilter === 'pascabayar') return item.type === 'pascabayar';
    return true;
  });

  const handleSelectService = (service) => {
    setActiveService(service);
    setCustomerNumber('');
    setSelectedNominal(null);
    setBillResult(null);
  };

  const handleCheckBill = () => {
    if (!customerNumber.trim()) {
      Alert.alert('Perhatian', 'Harap masukkan Nomor Pelanggan / Nomor HP.');
      return;
    }
    setIsCheckingBill(true);
    setTimeout(() => {
      setIsCheckingBill(false);
      setBillResult({
        namaPelanggan: 'Bpk. Jazmanudin (Pelanggan Resmi)',
        periode: 'September 2026',
        tagihan: 148500,
        biayaAdmin: 2500,
        totalBayar: 151000,
      });
    }, 800);
  };

  const handleProcessTransaction = () => {
    if (!customerNumber.trim()) {
      Alert.alert('Perhatian', 'Harap masukkan Nomor HP / ID Pelanggan.');
      return;
    }

    if (activeService.type === 'prabayar' && !selectedNominal) {
      Alert.alert('Perhatian', 'Pilih nominal produk / kuota yang ingin dibeli.');
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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, isDesktop && styles.desktopModalContainer]}>
          {/* Header Modal */}
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <View style={styles.iconCircleHeader}>
                <Ionicons name="flash" size={20} color="#D91E28" />
              </View>
              <View>
                <Text style={styles.modalTitle}>DigiFlazz PPOB & Pulsa</Text>
                <Text style={styles.modalSubtitle}>Isi ulang pulsa, token, kuota & bayar tagihan 24 jam</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* If Service Selected: Form View */}
          {activeService ? (
            <ScrollView style={styles.formScrollView} contentContainerStyle={{ padding: 16 }}>
              <TouchableOpacity
                onPress={() => setActiveService(null)}
                style={styles.backBtnRow}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={18} color="#0284C7" />
                <Text style={styles.backBtnText}>Kembali ke Daftar Layanan</Text>
              </TouchableOpacity>

              {/* Selected Service Card Info */}
              <View style={[styles.selectedServiceCard, { backgroundColor: activeService.bgColor }]}>
                <Ionicons name={activeService.icon} size={28} color={activeService.color} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.selectedServiceTitle}>{activeService.title}</Text>
                  <Text style={styles.selectedServiceDesc}>{activeService.desc}</Text>
                </View>
              </View>

              {/* Input Nomor HP / ID Pelanggan */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {activeService.id.includes('pln') ? 'Nomor Meter / ID Pelanggan PLN' : 'Nomor HP / ID Pelanggan:'}
                </Text>
                <View style={styles.inputBox}>
                  <Ionicons name="card-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
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

              {/* Form Content Depending on Prabayar / Pascabayar */}
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
                /* Pascabayar Cek Tagihan */
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
                      <Text style={styles.billResultTitle}>Rincian Tagihan ditemukan!</Text>
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
          ) : (
            /* Service List Grid View */
            <View style={styles.mainGridContent}>
              {/* Category Filter Tabs */}
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterChip, selectedFilter === 'semua' && styles.filterChipActive]}
                  onPress={() => setSelectedFilter('semua')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, selectedFilter === 'semua' && styles.filterTextActive]}>
                    Semua Layanan (12)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterChip, selectedFilter === 'prabayar' && styles.filterChipActive]}
                  onPress={() => setSelectedFilter('prabayar')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, selectedFilter === 'prabayar' && styles.filterTextActive]}>
                    Prabayar & Isi Ulang
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterChip, selectedFilter === 'pascabayar' && styles.filterChipActive]}
                  onPress={() => setSelectedFilter('pascabayar')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, selectedFilter === 'pascabayar' && styles.filterTextActive]}>
                    Tagihan Pascabayar
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Grid 12 Services */}
              <ScrollView contentContainerStyle={styles.servicesGridContainer}>
                <View style={styles.servicesRow}>
                  {filteredServices.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={[styles.serviceCard, { width: `${100 / numColumns - 2}%` }]}
                      onPress={() => handleSelectService(service)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.serviceIconWrap, { backgroundColor: service.bgColor }]}>
                        <Ionicons name={service.icon} size={24} color={service.color} />
                      </View>
                      <Text style={styles.serviceTitle}>{service.title}</Text>
                      <Text style={styles.serviceDesc} numberOfLines={2}>
                        {service.desc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
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
    padding: 12,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  desktopModalContainer: {
    maxWidth: 820,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircleHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  mainGridContent: {
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#D91E28',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  servicesGridContainer: {
    paddingBottom: 20,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    textAlign: 'center',
  },
  serviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  serviceDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  formScrollView: {
    flex: 1,
  },
  backBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 6,
  },
  backBtnText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 13,
  },
  selectedServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  selectedServiceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  selectedServiceDesc: {
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
    marginTop: 8,
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
    marginTop: 8,
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
