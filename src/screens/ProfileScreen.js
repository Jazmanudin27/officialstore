import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.avatarBox}>
        <Ionicons name="person-circle" size={80} color={COLORS.accent} />
        <Text style={styles.userName}>Pelanggan Setia Official Store</Text>
        <Text style={styles.userStatus}>VIP Gold Member 👑</Text>
      </View>

      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Riwayat Pesanan', 'Tidak ada pesanan aktif saat ini.')}>
          <Ionicons name="receipt-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.menuText}>Riwayat Pesanan</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Voucher Saya', 'Voucher Rp 50.000 Gratis Ongkir Tersedia!')}>
          <Ionicons name="ticket-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.menuText}>Voucher & Diskon Saya</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Pusat Bantuan', 'Hubungi CS Official Store 24/7 di cs@officialstore.co.id')}>
          <Ionicons name="help-buoy-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.menuText}>Pusat Bantuan & CS</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  avatarBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  userStatus: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  menuCard: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
});
