import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../../utils/formatters';
import { COLORS } from '../../constants/theme';
import AddressModal from '../../screens/AddressModal';

export default function CartModal({
  visible,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onProceedToCheckout,
  onOpenAddress,
  selectedAddress,
  onSelectAddress,
  onStartShopping,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [selectAll, setSelectAll] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleStartShopping = () => {
    onClose();
    if (onStartShopping) onStartShopping();
  };

  const handleProceedToCheckout = () => {
    onClose();
    if (onCheckout) onCheckout();
    if (onProceedToCheckout) onProceedToCheckout();
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
          <Text style={styles.headerTitle}>Keranjang</Text>
        </View>
        {cartItems.length === 0 ? (
          /* ==================== EMPTY CART STATE ==================== */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={68} color="#D91E28" />
            </View>
            <Text style={styles.emptyTitle}>Keranjang Belanjamu Kosong</Text>
            <Text style={styles.emptySubtitle}>
              Wah, belum ada produk di keranjangmu nih. Yuk cari aneka bumbu, saus, dan produk kebutuhanmu sekarang!
            </Text>
            <TouchableOpacity
              style={styles.belanjaSekarangBtn}
              onPress={handleStartShopping}
              activeOpacity={0.85}
            >
              <Ionicons name="bag-handle-outline" size={20} color={COLORS.white} />
              <Text style={styles.belanjaSekarangText}>Belanja Sekarang</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ==================== FILLED CART CONTENT ==================== */
          <>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
              {/* Shipping Address Box */}
              <TouchableOpacity
                style={styles.addressCard}
                onPress={() => setIsAddressModalOpen(true)}
                activeOpacity={0.8}
              >
                <View style={styles.addressLeft}>
                  <View style={styles.truckIconBox}>
                    <Ionicons
                      name={selectedAddress?.isPickup ? 'storefront' : 'bicycle'}
                      size={24}
                      color="#D91E28"
                    />
                  </View>
                  <View style={styles.addressDetails}>
                    <View style={styles.addressTitleRow}>
                      <Text style={styles.addressTitle}>
                        {selectedAddress
                          ? selectedAddress.isPickup
                            ? `${selectedAddress.title} (Pickup)`
                            : `${selectedAddress.title || 'Rumah'} - ${selectedAddress.recipient || 'Pelanggan'}`
                          : 'Belum Ada Alamat Terpilih'}
                      </Text>
                      {selectedAddress?.isPickup ? (
                        <View style={[styles.utamaBadge, { backgroundColor: '#0284C7' }]}>
                          <Text style={styles.utamaText}>Pickup</Text>
                        </View>
                      ) : (
                        selectedAddress?.isUtama && (
                          <View style={styles.utamaBadge}>
                            <Text style={styles.utamaText}>Utama</Text>
                          </View>
                        )
                      )}
                    </View>
                    <Text style={styles.addressSub} numberOfLines={1}>
                      {selectedAddress
                        ? selectedAddress.addressLine1
                        : 'Klik untuk memilih atau menambah alamat pengiriman'}
                    </Text>
                    {selectedAddress?.note ? (
                      <View style={styles.noteRow}>
                        <Ionicons name="document-text-outline" size={13} color="#64748B" />
                        <Text style={styles.noteText}>{selectedAddress.note}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={styles.gantiBtn}>
                  <Text style={styles.gantiBtnText}>Ganti</Text>
                </View>
              </TouchableOpacity>

              {/* Checkbox "Pilih Semua" */}
              <TouchableOpacity
                style={styles.pilihSemuaRow}
                onPress={() => setSelectAll(!selectAll)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={selectAll ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={selectAll ? '#0284C7' : '#94A3B8'}
                />
                <Text style={styles.pilihSemuaText}>Pilih Semua</Text>
              </TouchableOpacity>

              {/* Delivery Group Header: Pengiriman Instan */}
              <View style={styles.deliverySection}>
                <TouchableOpacity
                  style={styles.deliveryHeader}
                  onPress={() => setSelectAll(!selectAll)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={selectAll ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={selectAll ? '#0284C7' : '#94A3B8'}
                  />
                  <Ionicons
                    name={selectedAddress?.isPickup ? 'storefront' : 'flash'}
                    size={18}
                    color="#D91E28"
                    style={{ marginLeft: 8 }}
                  />
                  <Text style={styles.deliveryTitle}>
                    {selectedAddress?.isPickup ? 'Ambil di Toko' : 'Pengiriman Instan'}
                  </Text>
                </TouchableOpacity>

                {/* Product Item List */}
                <View style={styles.itemList}>
                  {cartItems.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <TouchableOpacity activeOpacity={0.7}>
                        <Ionicons
                          name={selectAll ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={selectAll ? '#0284C7' : '#94A3B8'}
                        />
                      </TouchableOpacity>

                      <Image source={{ uri: item.image }} style={styles.itemImage} />

                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemPrice}>{formatRupiah(item.price)}</Text>
                      </View>

                      {/* Plus Minus Stepper Control */}
                      <View style={styles.stepperContainer}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() =>
                            onUpdateQuantity && onUpdateQuantity(item.id, item.quantity - 1)
                          }
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                            size={16}
                            color={item.quantity === 1 ? '#EF4444' : '#0284C7'}
                          />
                        </TouchableOpacity>

                        <Text style={styles.stepperValue}>{item.quantity}</Text>

                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() =>
                            onUpdateQuantity && onUpdateQuantity(item.id, item.quantity + 1)
                          }
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={16} color="#0284C7" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View style={styles.bottomBarContainer}>
              <TouchableOpacity
                style={styles.bottomBarBtn}
                onPress={handleProceedToCheckout}
                activeOpacity={0.85}
              >
                <Text style={styles.bottomBarTotal}>{formatRupiah(totalPrice)}</Text>
                <Text style={styles.bottomBarAction}>Selanjutnya</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <AddressModal
          visible={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          selectedAddress={selectedAddress}
          onSelectAddress={(addr) => {
            setIsAddressModalOpen(false);
            if (onSelectAddress) onSelectAddress(addr);
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
    width: 600,
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
    paddingBottom: 80,
  },
  /* Address Card */
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 10,
  },
  truckIconBox: {
    marginRight: 10,
    marginTop: 2,
  },
  addressDetails: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  utamaBadge: {
    backgroundColor: '#D91E28',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  utamaText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  addressSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteText: {
    fontSize: 11,
    color: '#64748B',
  },
  gantiBtn: {
    borderWidth: 1.5,
    borderColor: '#0284C7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  gantiBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  /* Yellow Tebus Murah Box */
  promoBox: {
    backgroundColor: '#FDE047',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoLeft: {
    flex: 1,
    marginRight: 10,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  promoSub: {
    fontSize: 12,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  promoThumbRow: {
    flexDirection: 'row',
    gap: 4,
  },
  thumbMini: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ambilBtn: {
    borderWidth: 1.5,
    borderColor: '#0284C7',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  ambilBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  /* Select All Row */
  pilihSemuaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  pilihSemuaText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  /* Delivery Section */
  deliverySection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginLeft: 6,
  },
  itemList: {
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginHorizontal: 10,
    backgroundColor: '#F1F5F9',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D91E28',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    minWidth: 16,
    textAlign: 'center',
  },
  /* Bottom Action Bar */
  bottomBarContainer: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  bottomBarBtn: {
    backgroundColor: '#005691',
    borderRadius: 10,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomBarTotal: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },
  bottomBarAction: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  /* Empty State Styles */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
    backgroundColor: '#F8FAFC',
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  belanjaSekarangBtn: {
    backgroundColor: '#D91E28',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#D91E28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  belanjaSekarangText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
