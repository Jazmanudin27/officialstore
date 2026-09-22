import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function VoucherScreen({ visible, onClose, onSelectVoucher }) {
  const [inputCode, setInputCode] = useState('');

  const vouchers = [
    {
      id: 'v1',
      title: 'Voucher Cimory Eat Milk Puding Susu 80g Rp2.500',
      expiry: 'Kedaluwarsa 22 Sep 2026',
      tags: ['Alfagift', 'Alfamart'],
      code: 'C3A8860F8FQF',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80',
      maxUsageBadge: null,
      discountAmount: 2500,
    },
    {
      id: 'v2',
      title: 'A-VOUCHER RP7.000',
      expiry: 'Kedaluwarsa 30 Sep 2026',
      tags: ['Alfagift'],
      code: 'CF4FA2840JTE',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=80',
      maxUsageBadge: 'Maksimal 1x/transaksi',
      discountAmount: 7000,
    },
    {
      id: 'v3',
      title: 'Voucher Minyak Goreng Bimoli 2L Potongan Rp5.000',
      expiry: 'Kedaluwarsa 15 Okt 2026',
      tags: ['Alfagift', 'Alfamart'],
      code: 'BM5000OFF',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80',
      maxUsageBadge: 'Promo Khusus',
      discountAmount: 5000,
    },
  ];

  const handleApplyVoucher = (voucher) => {
    if (onSelectVoucher) {
      onSelectVoucher(voucher);
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* Red Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Voucher</Text>
          </View>

          <Text style={styles.headerNotice}>
            Batas penggunaan voucher maksimal 3x per-transaksi & 5x per-hari
          </Text>

          {/* Search / Scan Voucher Code Input Box */}
          <View style={styles.inputBox}>
            <View style={styles.percentBadge}>
              <Ionicons name="pricetag" size={16} color="#0284C7" />
            </View>
            <TextInput
              style={styles.inputField}
              placeholder="Masukkan/Scan Kode Voucher"
              placeholderTextColor="#94A3B8"
              value={inputCode}
              onChangeText={setInputCode}
            />
          </View>
        </View>

        {/* Curved White Container Body */}
        <View style={styles.bodyWrap}>
          <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Recommendation Box */}
            <View style={styles.recommendCard}>
              <View style={styles.recommendLeft}>
                <View style={styles.sparkleCircle}>
                  <Ionicons name="sparkles" size={16} color="#0284C7" />
                </View>
                <Text style={styles.recommendText}>Gunakan rekomendasi voucher</Text>
              </View>

              <TouchableOpacity style={styles.cobaBtn} activeOpacity={0.7}>
                <Text style={styles.cobaBtnText}>Coba</Text>
              </TouchableOpacity>
            </View>

            {/* Voucher Section Title */}
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Voucher Alfamart</Text>
              <Ionicons name="information-circle-outline" size={18} color="#64748B" />
            </View>
            <Text style={styles.voucherCountText}>44 Voucher</Text>

            {/* Voucher Cards List */}
            <View style={styles.voucherList}>
              {vouchers.map((voucher) => (
                <View key={voucher.id} style={styles.voucherCard}>
                  {/* Optional Max Usage Red Badge Ribbon */}
                  {voucher.maxUsageBadge && (
                    <View style={styles.ribbonBadge}>
                      <Text style={styles.ribbonText}>{voucher.maxUsageBadge}</Text>
                    </View>
                  )}

                  {/* Main Voucher Info Row */}
                  <View style={styles.cardMainRow}>
                    <Image source={{ uri: voucher.image }} style={styles.voucherImg} />

                    <View style={styles.voucherInfo}>
                      <Text style={styles.voucherTitle} numberOfLines={2}>
                        {voucher.title}
                      </Text>
                      <Text style={styles.expiryText}>
                        {voucher.expiry}
                      </Text>

                      {/* Tag Pills Row */}
                      <View style={styles.tagsRow}>
                        {voucher.tags.map((tag, idx) => (
                          <View key={idx} style={styles.tagPill}>
                            <Ionicons
                              name={tag === 'Alfagift' ? 'phone-portrait-outline' : 'storefront-outline'}
                              size={12}
                              color="#0284C7"
                            />
                            <Text style={styles.tagPillText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Dashed Divider Line */}
                  <View style={styles.dashedDivider} />

                  {/* Voucher Action Bottom Row */}
                  <View style={styles.cardBottomRow}>
                    <View style={styles.codeBox}>
                      <Text style={styles.codeText}>Kode: {voucher.code}</Text>
                    </View>

                    <View style={styles.actionBtnsRow}>
                      <TouchableOpacity style={styles.detailBtn} activeOpacity={0.7}>
                        <Text style={styles.detailBtnText}>Detail</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.pilihBtn}
                        onPress={() => handleApplyVoucher(voucher)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.pilihBtnText}>Pilih</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 99999,
    backgroundColor: '#D91E28',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#D91E28',
  },
  header: {
    backgroundColor: '#D91E28',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  headerNotice: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 44,
  },
  percentBadge: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    borderWidth: 0,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  bodyWrap: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  /* Recommendation Card */
  recommendCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F472B6',
  },
  recommendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sparkleCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  cobaBtn: {
    borderWidth: 1.5,
    borderColor: '#0284C7',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  cobaBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  /* Section Title */
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  voucherCountText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  /* Voucher List */
  voucherList: {
    gap: 14,
  },
  voucherCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  ribbonBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#B91C1C',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomRightRadius: 8,
    zIndex: 10,
  },
  ribbonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 6,
  },
  voucherImg: {
    width: 65,
    height: 65,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  expiryText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  dashedDivider: {
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeBox: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  pilihBtn: {
    borderWidth: 1.5,
    borderColor: '#0284C7',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  pilihBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
});
