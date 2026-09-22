import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function AddressModal({
  visible,
  onClose,
  onSelectAddress,
  selectedAddress,
  user,
  onOpenAuth,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [fulfillmentMode, setFulfillmentMode] = useState(
    selectedAddress?.isPickup ? 'pickup' : 'delivery'
  );
  const [selectedAddressId, setSelectedAddressId] = useState(
    selectedAddress?.isPickup ? 'addr1' : selectedAddress?.id || 'addr1'
  );
  const [selectedStoreId, setSelectedStoreId] = useState(
    selectedAddress?.isPickup ? selectedAddress?.id : 's1'
  );
  const [storeSearchText, setStoreSearchText] = useState('');

  // Form state for adding/editing address
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [formTitle, setFormTitle] = useState('Rumah');
  const [formRecipient, setFormRecipient] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddressLine1, setFormAddressLine1] = useState('');
  const [formAddressLine2, setFormAddressLine2] = useState('');
  const [formNote, setFormNote] = useState('');

  const getInitialAddresses = (currentUser) => {
    if (currentUser && currentUser.namaLengkap && currentUser.alamat) {
      return [
        {
          id: `user_addr_main_${currentUser.id || 1}`,
          title: 'Rumah',
          isUtama: true,
          recipient: currentUser.namaLengkap,
          phone: currentUser.phone || '',
          addressLine1: currentUser.alamat,
          addressLine2: 'Alamat Utama Terdaftar',
          note: null,
        },
      ];
    }
    return [];
  };

  const [addressList, setAddressList] = useState(() => getInitialAddresses(user));

  React.useEffect(() => {
    setAddressList(getInitialAddresses(user));
  }, [user]);

  React.useEffect(() => {
    if (selectedAddress?.isPickup) {
      setFulfillmentMode('pickup');
      if (selectedAddress?.id) setSelectedStoreId(selectedAddress.id);
    } else if (selectedAddress?.id) {
      setFulfillmentMode('delivery');
      setSelectedAddressId(selectedAddress.id);
    }
  }, [selectedAddress]);

  const stores = [
    {
      id: 's1',
      name: 'PERINTIS 158',
      address: 'Jl Perintis Kemerdekaan No 158 Rt 002 Rw 002 Kecamatan Kawalu Kelurahan Karsamenak',
      distance: '0,16 km',
      hours: '07:00 - 22:00',
    },
    {
      id: 's2',
      name: 'PESANTREN AMANAH',
      address: 'Jl Sambong Jaya No 50 Rt 001 Rw 013 Kec. Mangkubumi Kel. Sambongjaya',
      distance: '0,97 km',
      hours: '07:00 - 22:00',
    },
    {
      id: 's3',
      name: 'MANGKUBUMI 2',
      address: 'Jl. Mayor SL Tobing No. 42 RT 01 RW 04 Kel. Sambongjaya Kec. Mangkubumi',
      distance: '1,25 km',
      hours: '07:00 - 22:00',
    },
    {
      id: 's4',
      name: 'CIHIDEUNG TASIK',
      address: 'Jl. Cihideung Balong No. 12 RT 03 RW 01 Kel. Nagarawangi Kec. Cihideung',
      distance: '1,80 km',
      hours: '06:30 - 22:00',
    },
  ];

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(storeSearchText.toLowerCase()) ||
      s.address.toLowerCase().includes(storeSearchText.toLowerCase())
  );

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    if (onSelectAddress) {
      onSelectAddress({
        ...addr,
        isPickup: false,
      });
    }
    onClose();
  };

  const handleSelectStore = (store) => {
    setSelectedStoreId(store.id);
    if (onSelectAddress) {
      onSelectAddress({
        id: store.id,
        isPickup: true,
        title: store.name,
        recipient: 'Ambil di Toko',
        phone: '0895238888200',
        addressLine1: store.address,
        addressLine2: `Jarak: ${store.distance} • Jam Operasional: ${store.hours}`,
        note: 'Toko Buka • Siap Diambil',
      });
    }
    onClose();
  };

  const handleOpenAdd = () => {
    setEditingAddrId(null);
    setFormTitle('Rumah');
    setFormRecipient(user?.namaLengkap || '');
    setFormPhone(user?.phone || '');
    setFormAddressLine1(user?.alamat || '');
    setFormAddressLine2('');
    setFormNote('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddrId(addr.id);
    setFormTitle(addr.title);
    setFormRecipient(addr.recipient);
    setFormPhone(addr.phone);
    setFormAddressLine1(addr.addressLine1);
    setFormAddressLine2(addr.addressLine2);
    setFormNote(addr.note || '');
    setIsFormOpen(true);
  };

  const handleSaveForm = () => {
    if (!formRecipient.trim() || !formAddressLine1.trim()) {
      alert('Mohon lengkapi Nama Penerima dan Alamat Lengkap.');
      return;
    }
    if (editingAddrId) {
      const updated = addressList.map((item) =>
        item.id === editingAddrId
          ? {
              ...item,
              title: formTitle,
              recipient: formRecipient,
              phone: formPhone,
              addressLine1: formAddressLine1,
              addressLine2: formAddressLine2 || 'Tasikmalaya, Jawa Barat',
              note: formNote || null,
            }
          : item
      );
      setAddressList(updated);
      const updatedItem = updated.find((a) => a.id === editingAddrId);
      if (updatedItem) handleSelectAddress(updatedItem);
    } else {
      const newAddr = {
        id: `addr_${Date.now()}`,
        title: formTitle || 'Alamat Baru',
        isUtama: addressList.length === 0,
        recipient: formRecipient,
        phone: formPhone,
        addressLine1: formAddressLine1,
        addressLine2: formAddressLine2 || 'Tasikmalaya, Jawa Barat',
        note: formNote || null,
      };
      const updated = [...addressList, newAddr];
      setAddressList(updated);
      handleSelectAddress(newAddr);
    }
    setIsFormOpen(false);
  };

  const handleMakeUtama = (addr) => {
    const updated = addressList.map((item) => ({
      ...item,
      isUtama: item.id === addr.id,
    }));
    setAddressList(updated);
    const target = updated.find((a) => a.id === addr.id);
    if (target) handleSelectAddress(target);
  };

  const handleDeleteAddress = (addrId) => {
    if (addressList.length <= 1) {
      alert('Minimal harus ada 1 alamat pengiriman.');
      return;
    }
    const updated = addressList.filter((a) => a.id !== addrId);
    setAddressList(updated);
    if (selectedAddressId === addrId && updated.length > 0) {
      handleSelectAddress(updated[0]);
    }
  };

  if (!visible) return null;

  return (
    <View style={isDesktop ? styles.desktopOverlay : styles.overlayContainer}>
      <SafeAreaView style={isDesktop ? styles.desktopModalCard : styles.safeArea}>
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

            {fulfillmentMode === 'delivery' ? (
              /* ==================== DELIVERY VIEW ==================== */
              <>
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

                {/* User Account Banner */}
                {user ? (
                  <View style={styles.userBannerBox}>
                    <Ionicons name="person-circle-outline" size={20} color="#0284C7" />
                    <Text style={styles.userBannerText}>
                      Menampilkan alamat untuk akun: <Text style={{ fontWeight: '800', color: '#0F172A' }}>{user.namaLengkap}</Text>
                    </Text>
                  </View>
                ) : (
                  <View style={styles.guestBannerBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#D97706" />
                    <Text style={styles.guestBannerText}>
                      Anda mengakses sebagai Tamu. Silakan <Text style={{ fontWeight: '800', color: '#D91E28' }}>Masuk / Daftar</Text> untuk menyimpan alamat pribadi.
                    </Text>
                  </View>
                )}

                {/* Section Header: Daftar Alamat */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Daftar Alamat</Text>
                  <TouchableOpacity style={styles.tambahAlamatBtn} activeOpacity={0.7} onPress={handleOpenAdd}>
                    <Ionicons name="add" size={16} color="#0284C7" />
                    <Text style={styles.tambahAlamatText}>Tambah Alamat</Text>
                  </TouchableOpacity>
                </View>

                {/* Address Cards List */}
                {addressList.length === 0 ? (
                  <View style={styles.emptyAddressBox}>
                    <View style={styles.emptyIconCircle}>
                      <Ionicons name="location-outline" size={36} color="#94A3B8" />
                    </View>
                    <Text style={styles.emptyTitle}>Belum Ada Alamat Pengiriman</Text>
                    <Text style={styles.emptySub}>
                      {user
                        ? 'Anda belum memiliki alamat tersimpan. Klik "Tambah Alamat" di atas untuk menyimpan lokasi pengiriman Anda.'
                        : 'Anda belum masuk ke akun. Silakan masuk untuk menyimpan alamat Anda atau klik "Tambah Alamat".'}
                    </Text>
                    {!user && onOpenAuth && (
                      <TouchableOpacity
                        style={styles.loginFromAddressBtn}
                        onPress={() => {
                          onClose();
                          onOpenAuth();
                        }}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.loginFromAddressText}>Masuk / Daftar Sekarang</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={styles.addressList}>
                    {addressList.map((item) => {
                      const isSelected = item.id === selectedAddressId;

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.addressCard,
                            isSelected && styles.addressCardSelected,
                          ]}
                          onPress={() => !isSelected && handleSelectAddress(item)}
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
                            <TouchableOpacity style={styles.ubahBtnSingle} onPress={() => handleOpenEdit(item)}>
                              <Text style={styles.actionText}>Ubah</Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.actionRowMulti}>
                              <TouchableOpacity onPress={() => handleMakeUtama(item)}>
                                <Text style={styles.actionText}>Jadikan Alamat Utama</Text>
                              </TouchableOpacity>
                              <View style={styles.verticalDivider} />
                              <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
                                <Text style={styles.actionText}>Hapus</Text>
                              </TouchableOpacity>
                              <View style={styles.verticalDivider} />
                              <TouchableOpacity onPress={() => handleOpenEdit(item)}>
                                <Text style={styles.actionText}>Ubah</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            ) : (
              /* ==================== PICKUP VIEW ==================== */
              <>
                {/* Pickup Benefit Card Banner */}
                <TouchableOpacity style={styles.benefitCard} activeOpacity={0.7}>
                  <View style={styles.benefitLeft}>
                    <View style={styles.pickupBagCircle}>
                      <Ionicons name="bag-handle" size={20} color="#0284C7" />
                    </View>
                    <Text style={styles.benefitText}>Lihat benefit pick-up di sini</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#0284C7" />
                </TouchableOpacity>

                {/* Store Search Input Bar */}
                <View style={styles.storeSearchBox}>
                  <Ionicons name="search-outline" size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.storeSearchInput}
                    placeholder="Cari nama, kode atau alamat toko"
                    placeholderTextColor="#94A3B8"
                    value={storeSearchText}
                    onChangeText={setStoreSearchText}
                  />
                  {storeSearchText.length > 0 && (
                    <TouchableOpacity onPress={() => setStoreSearchText('')}>
                      <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Section Title */}
                <Text style={styles.tokoSekitarmuTitle}>Toko di sekitarmu</Text>

                {/* Stylized Google Map Preview Card */}
                <View style={styles.mapCard}>
                  <View style={styles.mapCanvas}>
                    {/* Map Decorative Road Lines */}
                    <View style={styles.mapRoad1} />
                    <View style={styles.mapRoad2} />
                    <View style={styles.mapRoad3} />
                    <View style={styles.mapRiver} />

                    {/* Central Radar Coverage Circle */}
                    <View style={styles.mapRadiusCircle}>
                      {/* User Location Center Pin */}
                      <View style={styles.userLocationPin}>
                        <View style={styles.userPinInner} />
                      </View>
                    </View>

                    {/* City Label */}
                    <View style={styles.cityLabelWrap}>
                      <Text style={styles.cityLabelText}>Kota Tasikmalaya</Text>
                    </View>

                    {/* CIKEDEWUL Watermark Label from Screenshot */}
                    <View style={styles.cikedewulWrap}>
                      <Text style={styles.cikedewulText}>CIKEDEWUL</Text>
                    </View>

                    {/* Landmark Label */}
                    <View style={styles.landmarkWrap}>
                      <Ionicons name="school" size={13} color="#475569" />
                      <Text style={styles.landmarkText}>Universitas Kampus</Text>
                    </View>

                    {/* Scattered Red Pins with White 'A' Logo Matching Screenshot */}
                    <View style={[styles.storePin, { top: 22, left: '33%' }]}>
                      <Text style={styles.storePinLetter}>A</Text>
                      <View style={styles.pinPointer} />
                    </View>
                    <View style={[styles.storePin, { top: 14, left: '49%' }]}>
                      <Text style={styles.storePinLetter}>A</Text>
                      <View style={styles.pinPointer} />
                    </View>
                    <View style={[styles.storePin, { top: 36, left: '56%' }]}>
                      <Text style={styles.storePinLetter}>A</Text>
                      <View style={styles.pinPointer} />
                    </View>
                    <View style={[styles.storePin, { top: 72, left: '37%' }]}>
                      <Text style={styles.storePinLetter}>A</Text>
                      <View style={styles.pinPointer} />
                    </View>
                    <View style={[styles.storePin, { top: 90, left: '50%' }]}>
                      <Text style={styles.storePinLetter}>A</Text>
                      <View style={styles.pinPointer} />
                    </View>
                    <View style={[styles.storePin, { top: 104, left: '40%' }]}>
                      <Text style={styles.storePinLetter}>A</Text>
                      <View style={styles.pinPointer} />
                    </View>
                    <View style={[styles.storePin, { top: 64, left: '60%' }]}>
                      <Text style={styles.storePinLetter}>A</Text>
                      <View style={styles.pinPointer} />
                    </View>
                    <View style={[styles.storePin, { top: 100, left: '61%' }]}>
                      <Text style={styles.storePinLetter}>A</Text>
                      <View style={styles.pinPointer} />
                    </View>

                    {/* Google Logo Bottom Left */}
                    <View style={styles.googleLogoWrap}>
                      <Text style={styles.googleLogoText}>
                        <Text style={{ color: '#4285F4' }}>G</Text>
                        <Text style={{ color: '#EA4335' }}>o</Text>
                        <Text style={{ color: '#FBBC05' }}>o</Text>
                        <Text style={{ color: '#4285F4' }}>g</Text>
                        <Text style={{ color: '#34A853' }}>l</Text>
                        <Text style={{ color: '#EA4335' }}>e</Text>
                      </Text>
                    </View>

                    {/* GPS Locate Target Button Bottom Right */}
                    <TouchableOpacity style={styles.gpsLocateBtn} activeOpacity={0.8}>
                      <Ionicons name="locate" size={20} color="#0284C7" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Store Cards List */}
                <View style={styles.storesList}>
                  {filteredStores.map((store) => {
                    const isSelected = store.id === selectedStoreId;

                    return (
                      <TouchableOpacity
                        key={store.id}
                        style={[
                          styles.storeCard,
                          isSelected && styles.storeCardSelected,
                        ]}
                        onPress={() => handleSelectStore(store)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.storeCardBody}>
                          <View style={styles.storeTextSection}>
                            <Text style={styles.storeName}>{store.name}</Text>
                            <Text style={styles.storeAddress}>{store.address}</Text>

                            <View style={styles.storeMetaRow}>
                              <View style={styles.metaItem}>
                                <Ionicons name="location-outline" size={16} color="#0284C7" />
                                <Text style={styles.metaText}>{store.distance}</Text>
                              </View>

                              <Text style={styles.bulletDot}>•</Text>

                              <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={16} color="#0284C7" />
                                <Text style={styles.metaText}>{store.hours}</Text>
                              </View>
                            </View>
                          </View>

                          {/* Right Radio Selection Checkmark matching screenshot */}
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleSelected,
                            ]}
                          >
                            <Ionicons
                              name="checkmark"
                              size={15}
                              color={COLORS.white}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>
        </View>

        {/* Add / Edit Address Form Modal Overlay */}
        {isFormOpen && (
          <View style={styles.formModalOverlay}>
            <View style={styles.formCardContainer}>
              <View style={styles.formHeaderRow}>
                <Text style={styles.formHeaderTitle}>
                  {editingAddrId ? 'Ubah Alamat Pengiriman' : 'Tambah Alamat Baru'}
                </Text>
                <TouchableOpacity onPress={() => setIsFormOpen(false)} style={styles.formCloseBtn}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formScrollView} contentContainerStyle={styles.formScrollContent}>
                <Text style={styles.inputLabel}>Label Alamat (misal: Rumah, Kantor, Kos)</Text>
                <TextInput
                  style={styles.formTextInput}
                  placeholder="Rumah / Kantor"
                  placeholderTextColor="#94A3B8"
                  value={formTitle}
                  onChangeText={setFormTitle}
                />

                <Text style={styles.inputLabel}>Nama Penerima *</Text>
                <TextInput
                  style={styles.formTextInput}
                  placeholder="Nama Lengkap Penerima"
                  placeholderTextColor="#94A3B8"
                  value={formRecipient}
                  onChangeText={setFormRecipient}
                />

                <Text style={styles.inputLabel}>Nomor HP Penerima *</Text>
                <TextInput
                  style={styles.formTextInput}
                  placeholder="Contoh: 08123456789"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={formPhone}
                  onChangeText={setFormPhone}
                />

                <Text style={styles.inputLabel}>Alamat Lengkap *</Text>
                <TextInput
                  style={[styles.formTextInput, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Jalan, Nomor Rumah, RT/RW, Kecamatan, Kota"
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={formAddressLine1}
                  onChangeText={setFormAddressLine1}
                />

                <Text style={styles.inputLabel}>Kabupaten / Kota & Provinsi</Text>
                <TextInput
                  style={styles.formTextInput}
                  placeholder="Tasikmalaya, Jawa Barat"
                  placeholderTextColor="#94A3B8"
                  value={formAddressLine2}
                  onChangeText={setFormAddressLine2}
                />

                <Text style={styles.inputLabel}>Catatan Patokan (opsional)</Text>
                <TextInput
                  style={styles.formTextInput}
                  placeholder="Contoh: Pagar warna hijau, dekat masjid"
                  placeholderTextColor="#94A3B8"
                  value={formNote}
                  onChangeText={setFormNote}
                />

                <View style={styles.formBtnRow}>
                  <TouchableOpacity
                    style={styles.formCancelBtn}
                    onPress={() => setIsFormOpen(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.formCancelText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.formSaveBtn}
                    onPress={handleSaveForm}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.formSaveText}>Simpan Alamat</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  userBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 4,
  },
  userBannerText: {
    fontSize: 12.5,
    color: '#0369A1',
    flex: 1,
  },
  guestBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 4,
  },
  guestBannerText: {
    fontSize: 12.5,
    color: '#92400E',
    flex: 1,
  },
  emptyAddressBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  loginFromAddressBtn: {
    backgroundColor: '#D91E28',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  loginFromAddressText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  formModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 999999,
  },
  formCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  formHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  formCloseBtn: {
    padding: 4,
  },
  formScrollView: {
    flex: 1,
  },
  formScrollContent: {
    padding: 16,
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
    marginBottom: 4,
  },
  formTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: COLORS.textDark,
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  formCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  formCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  formSaveBtn: {
    flex: 1.5,
    backgroundColor: '#D91E28',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  formSaveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  desktopOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 99999,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  desktopModalCard: {
    width: 600,
    maxHeight: '85%',
    backgroundColor: '#D91E28',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupBagCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E0F2FE',
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
  /* Address List (Delivery) */
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

  /* ==================== PICKUP STYLES ==================== */
  storeSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storeSearchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    borderWidth: 0,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  tokoSekitarmuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  /* Interactive Map Card */
  mapCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#EBF4F6',
  },
  mapCanvas: {
    height: 190,
    position: 'relative',
    backgroundColor: '#EDF5F7',
    overflow: 'hidden',
  },
  mapRoad1: {
    position: 'absolute',
    top: 50,
    left: -20,
    right: -20,
    height: 8,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-12deg' }],
  },
  mapRoad2: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: '48%',
    width: 9,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '24deg' }],
  },
  mapRoad3: {
    position: 'absolute',
    top: 110,
    left: -20,
    right: -20,
    height: 7,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '8deg' }],
  },
  mapRiver: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: '18%',
    width: 14,
    backgroundColor: '#BFDBFE',
    borderRadius: 8,
    transform: [{ rotate: '38deg' }],
  },
  mapRadiusCircle: {
    position: 'absolute',
    top: 25,
    left: '18%',
    width: 170,
    height: 140,
    borderRadius: 85,
    backgroundColor: 'rgba(2, 132, 199, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
    elevation: 3,
  },
  userPinInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#38BDF8',
  },
  cityLabelWrap: {
    position: 'absolute',
    top: 60,
    left: '36%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cityLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  cikedewulWrap: {
    position: 'absolute',
    bottom: 24,
    left: '20%',
  },
  cikedewulText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  landmarkWrap: {
    position: 'absolute',
    bottom: 40,
    right: 36,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  landmarkText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  storePin: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#D91E28',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  storePinLetter: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  pinPointer: {
    position: 'absolute',
    bottom: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 5,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#D91E28',
  },
  googleLogoWrap: {
    position: 'absolute',
    bottom: 8,
    left: 10,
  },
  googleLogoText: {
    fontSize: 14,
    fontWeight: '800',
  },
  gpsLocateBtn: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  /* Stores List */
  storesList: {
    gap: 12,
  },
  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storeCardSelected: {
    borderColor: '#0284C7',
    borderWidth: 1.5,
    backgroundColor: '#F0F9FF',
  },
  storeCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeTextSection: {
    flex: 1,
    marginRight: 14,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  bulletDot: {
    fontSize: 12,
    color: '#94A3B8',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: '#0284C7',
  },
});

