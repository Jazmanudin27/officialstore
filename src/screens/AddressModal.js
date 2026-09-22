import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function AddressModal({
  visible,
  onClose,
  onSelectAddress,
  selectedAddress,
}) {
  const [fulfillmentMode, setFulfillmentMode] = useState('delivery');
  const [selectedAddressId, setSelectedAddressId] = useState(
    selectedAddress?.id || 'addr1'
  );

  React.useEffect(() => {
    if (selectedAddress?.id) {
      setSelectedAddressId(selectedAddress.id);
    }
  }, [selectedAddress]);

  const addresses = [
    {
      id: 'addr1',
      title: 'Rumah',
      isUtama: true,
      recipient: 'Ade Fitri Nuraeni',
      phone: '0895238888200',
      addressLine1: 'Jl. Pasir Bokor, Kp. Gunung Jambe, RT/RW 03/09',
      addressLine2: 'Cipawitra, Kec. Mangkubumi, Kab. Tasikmalaya, Jawa Barat 46181, Indonesia',
      note: 'Patokan Rafasya Cell',
    },
    {
      id: 'addr2',
      title: 'Belakang Rumah Alm KH Emon',
      isUtama: false,
      recipient: 'Jazmanudin',
      phone: '0895238888200',
      addressLine1: 'Kp. Cihideung 2, RT 002, RW 003',
      addressLine2: 'Sukamahi, Kabupaten Tasikmalaya, Jawa Barat, Indonesia',
      note: null,
    },
    {
      id: 'addr3',
      title: 'KANTOR',
      isUtama: false,
      recipient: 'Jazmanudin',
      phone: '0895238888200',
      addressLine1: 'Jl Cagak, RT 04 RW 07 Karikil Kec. Mangkubumi',
      addressLine2: 'Kota Tasikmalaya, Jawa Barat, Indonesia',
      note: null,
    },
  ];

  const handleSelect = (addr) => {
    setSelectedAddressId(addr.id);
    if (onSelectAddress) {
      onSelectAddress(addr);
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Solid Red Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cara Belanja</Text>
        </View>

        <View style={styles.bodyWrapper}>
          <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Fulfillment Toggle (Delivery vs Pickup) */}
            <View style={styles.modeToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.modeBtn,
                  fulfillmentMode === 'delivery' && styles.modeBtnActive,
                ]}
                onPress={() => setFulfillmentMode('delivery')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modeText,
                    fulfillmentMode === 'delivery' && styles.modeTextActive,
                  ]}
                >
                  Delivery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeBtn,
                  fulfillmentMode === 'pickup' && styles.modeBtnActive,
                ]}
                onPress={() => setFulfillmentMode('pickup')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modeText,
                    fulfillmentMode === 'pickup' && styles.modeTextActive,
                  ]}
                >
                  Pickup
                </Text>
              </TouchableOpacity>
            </View>

            {/* Delivery Benefit Card Banner */}
            <TouchableOpacity style={styles.benefitCard} activeOpacity={0.7}>
              <View style={styles.benefitLeft}>
                <View style={styles.motorCircle}>
                  <Ionicons name="bicycle" size={20} color="#D91E28" />
                </View>
                <Text style={styles.benefitText}>Lihat benefit delivery di sini</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#0284C7" />
            </TouchableOpacity>

            {/* Section Header: Daftar Alamat */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Daftar Alamat</Text>
              <TouchableOpacity style={styles.tambahAlamatBtn} activeOpacity={0.7}>
                <Ionicons name="add" size={16} color="#0284C7" />
                <Text style={styles.tambahAlamatText}>Tambah Alamat</Text>
              </TouchableOpacity>
            </View>

            {/* Address Cards List */}
            <View style={styles.addressList}>
              {addresses.map((item) => {
                const isSelected = item.id === selectedAddressId;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.addressCard,
                      isSelected && styles.addressCardSelected,
                    ]}
                    onPress={() => !isSelected && handleSelect(item)}
                    activeOpacity={isSelected ? 1 : 0.75}
                  >
                    {/* Selected Address Ribbon */}
                    {isSelected && (
                      <View style={styles.selectedRibbon}>
                        <Text style={styles.selectedRibbonText}>Alamat Terpilih</Text>
                      </View>
                    )}

                    {/* Header Title Row */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.titleWithBadge}>
                        <Text style={styles.addressTitle}>{item.title}</Text>
                        {item.isUtama && (
                          <View style={styles.utamaRedBadge}>
                            <Text style={styles.utamaRedBadgeText}>Utama</Text>
                          </View>
                        )}
                      </View>

                      {!isSelected && (
                        <View style={styles.pilihBtn}>
                          <Text style={styles.pilihBtnText}>Pilih</Text>
                        </View>
                      )}
                    </View>

                    {/* Recipient Line */}
                    <Text style={styles.recipientLine}>
                      {item.recipient} - <Text style={{ color: '#475569' }}>{item.phone}</Text>
                    </Text>

                    {/* Full Address Lines */}
                    <Text style={styles.addressLine}>{item.addressLine1}</Text>
                    <Text style={styles.subAddressLine}>{item.addressLine2}</Text>

                    {/* Optional Note */}
                    {item.note && (
                      <View style={styles.noteRow}>
                        <Ionicons name="document-text-outline" size={13} color="#64748B" />
                        <Text style={styles.noteText}>{item.note}</Text>
                      </View>
                    )}

                    {/* Divider */}
                    <View style={styles.cardDivider} />

                    {/* Bottom Action Row */}
                    {isSelected ? (
                      <View style={styles.ubahBtnSingle}>
                        <Text style={styles.actionText}>Ubah</Text>
                      </View>
                    ) : (
                      <View style={styles.actionRowMulti}>
                        <Text style={styles.actionText}>Jadikan Alamat Utama</Text>
                        <View style={styles.verticalDivider} />
                        <Text style={styles.actionText}>Hapus</Text>
                        <View style={styles.verticalDivider} />
                        <Text style={styles.actionText}>Ubah</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
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
  bodyWrapper: {
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
  closeBtn: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginLeft: 14,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  /* Fulfillment Mode Toggle */
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 24,
    padding: 4,
    height: 48,
  },
  modeBtn: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#0284C7',
  },
  modeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  modeTextActive: {
    color: COLORS.white,
    fontWeight: '800',
  },
  /* Benefit Card */
  benefitCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  benefitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  motorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  tambahAlamatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tambahAlamatText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
  },
  /* Address List */
  addressList: {
    gap: 14,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  addressCardSelected: {
    borderColor: '#0284C7',
    borderWidth: 1.5,
  },
  selectedRibbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#005691',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  selectedRibbonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  utamaRedBadge: {
    backgroundColor: '#D91E28',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  utamaRedBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  pilihBtn: {
    borderWidth: 1.5,
    borderColor: '#0284C7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  pilihBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  recipientLine: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 2,
  },
  subAddressLine: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  noteText: {
    fontSize: 12,
    color: '#64748B',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  ubahBtnSingle: {
    alignItems: 'center',
  },
  actionRowMulti: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  verticalDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#CBD5E1',
  },
});
