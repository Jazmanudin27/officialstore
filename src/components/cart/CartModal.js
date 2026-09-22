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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../../utils/formatters';
import { COLORS } from '../../constants/theme';

export default function CartModal({
  visible,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onOpenAddress,
}) {
  const [selectAll, setSelectAll] = useState(true);

  // Default items if cart is empty, matching Screenshot 1
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
  const totalPrice = displayItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Solid Red Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Keranjang</Text>
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Shipping Address Box */}
          <View style={styles.addressCard}>
            <View style={styles.addressLeft}>
              <View style={styles.truckIconBox}>
                <Ionicons name="bicycle" size={24} color="#D91E28" />
              </View>
              <View style={styles.addressDetails}>
                <View style={styles.addressTitleRow}>
                  <Text style={styles.addressTitle}>Rumah - Ade Fitri Nuraeni</Text>
                  <View style={styles.utamaBadge}>
                    <Text style={styles.utamaText}>Utama</Text>
                  </View>
                </View>
                <Text style={styles.addressSub} numberOfLines={1}>
                  Jl. Pasir Bokor, Kp. Gunung Jambe...
                </Text>
                <View style={styles.noteRow}>
                  <Ionicons name="document-text-outline" size={13} color="#64748B" />
                  <Text style={styles.noteText}>Patokan Rafasya Cell</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.gantiBtn} onPress={onOpenAddress} activeOpacity={0.7}>
              <Text style={styles.gantiBtnText}>Ganti</Text>
            </TouchableOpacity>
          </View>

          {/* Yellow Promo Box "Tebus Murah!" */}
          <View style={styles.promoBox}>
            <View style={styles.promoLeft}>
              <Text style={styles.promoTitle}>Tebus Murah!</Text>
              <Text style={styles.promoSub}>
                Anda dapat membeli <Text style={{ fontWeight: '800' }}>2 produk</Text> dengan harga sangat murah
              </Text>
              <View style={styles.promoThumbRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View key={i} style={styles.thumbMini}>
                    <Ionicons name="cube-outline" size={14} color="#D91E28" />
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.ambilBtn} activeOpacity={0.7}>
              <Text style={styles.ambilBtnText}>Ambil</Text>
            </TouchableOpacity>
          </View>

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
              <Ionicons name="flash" size={18} color="#D91E28" style={{ marginLeft: 8 }} />
              <Text style={styles.deliveryTitle}>Pengiriman Instan</Text>
            </TouchableOpacity>

            {/* Product Item List */}
            <View style={styles.itemList}>
              {displayItems.map((item) => (
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
                      <Ionicons name="remove" size={16} color="#0284C7" />
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
            onPress={() => {
              if (onCheckout) onCheckout();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomBarTotal}>{formatRupiah(totalPrice)}</Text>
            <Text style={styles.bottomBarAction}>Selanjutnya</Text>
          </TouchableOpacity>
        </View>
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
});
