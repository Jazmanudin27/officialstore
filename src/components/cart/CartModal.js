import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../../utils/formatters';
import { COLORS } from '../../constants/theme';

export default function CartModal({ visible, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    Alert.alert(
      '🎉 Pesanan Berhasil Ditambahkan!',
      `Total Pembayaran: ${formatRupiah(subtotal)}\n\nTerima kasih telah berbelanja di Official Store! Pesanan Anda sedang diproses.`,
      [
        {
          text: 'Selesai',
          onPress: () => {
            onClearCart();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBox}>
              <Ionicons name="cart" size={22} color={COLORS.accent} />
              <Text style={styles.headerTitle}>Keranjang Belanja</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Cart Item List */}
          {cartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyTitle}>Keranjang Anda Kosong</Text>
              <Text style={styles.emptySubtitle}>Jelajahi produk resmi kami dan tambahkan ke keranjang.</Text>
            </View>
          ) : (
            <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{formatRupiah(item.price)}</Text>
                    
                    {/* Quantity controls */}
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={14} color={COLORS.textPrimary} />
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={14} color={COLORS.textPrimary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => onRemoveItem(item.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Footer Summary */}
          {cartItems.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ongkos Kirim (Promo)</Text>
                <Text style={styles.freeShipping}>GRATIS</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Pembayaran</Text>
                <Text style={styles.totalValue}>{formatRupiah(subtotal)}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleCheckout}
                activeOpacity={0.8}
              >
                <Ionicons name="bag-check" size={18} color={COLORS.primary} />
                <Text style={styles.checkoutText}>Beli Sekarang ({cartItems.length})</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  itemList: {
    marginVertical: 12,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    backgroundColor: COLORS.border,
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
    paddingTop: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  freeShipping: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '700',
  },
  totalLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  totalValue: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '800',
  },
  checkoutBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  checkoutText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '800',
  },
});
