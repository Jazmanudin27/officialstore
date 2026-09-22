import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ProfileScreen({
  user,
  onOpenAuth,
  onLogout,
  onOpenAddress,
  onGoToOrders,
  openSearch,
  openCart,
  cartCount = 0,
}) {
  const isLoggedIn = !!user;

  const handleLogoutConfirm = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Apakah Anda yakin ingin keluar dari akun Official Store?');
      if (confirmed && onLogout) {
        onLogout();
      }
    } else {
      Alert.alert(
        'Konfirmasi Keluar',
        'Apakah Anda yakin ingin keluar dari akun Official Store?',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Keluar', style: 'destructive', onPress: onLogout },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Red Header Bar (Matching Promo Tab Header) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Akun Saya</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={openSearch} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity onPress={openCart} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="bag-handle-outline" size={22} color={COLORS.white} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Top Header Card */}
        <View style={styles.profileHeaderCard}>
          {isLoggedIn ? (
            /* LOGGED IN USER CARD */
            <View style={styles.userTopRow}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={32} color="#D91E28" />
              </View>
              <View style={styles.userMainInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userNameText} numberOfLines={1}>
                    {user.namaLengkap || 'Pelanggan Setia'}
                  </Text>
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipBadgeText}>MEMBER</Text>
                  </View>
                </View>
                <Text style={styles.userPhoneText}>+{user.phone || '62895238888200'}</Text>
              </View>
            </View>
          ) : (
            /* GUEST / NOT LOGGED IN CARD */
            <View style={styles.guestBox}>
              <View style={styles.guestTop}>
                <View style={styles.avatarCircleGuest}>
                  <Ionicons name="person-outline" size={32} color="#64748B" />
                </View>
                <View style={styles.guestTextWrap}>
                  <Text style={styles.guestTitle}>Masuk atau Daftar</Text>
                  <Text style={styles.guestSub}>
                    Dapatkan diskon eksklusif dan kumpulkan poin belanja!
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={onOpenAuth}
                activeOpacity={0.85}
              >
                <Text style={styles.loginBtnText}>Masuk / Daftar Sekarang</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* Member Points & Balance Strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <View style={styles.statIconBox}>
                <Ionicons name="star" size={18} color="#EAB308" />
              </View>
              <View>
                <Text style={styles.statLabel}>A-Poin</Text>
                <Text style={styles.statValue}>{isLoggedIn ? user.poin || '500' : '0'}</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconBox}>
                <Ionicons name="wallet" size={18} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.statLabel}>Voucher</Text>
                <Text style={styles.statValue}>3 Tersedia</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconBox}>
                <Ionicons name="bag-check" size={18} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={styles.statValue}>Aktif</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Section: Akun & Transaksi */}
        <Text style={styles.sectionHeaderTitle}>Menu Akun</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={onGoToOrders || (() => Alert.alert('Riwayat Pesanan', 'Semua riwayat transaksi belanja Anda tercatat aman.'))}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="receipt-outline" size={20} color="#0284C7" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Riwayat Transaksi</Text>
              <Text style={styles.menuSub}>Lihat pesanan sedang dikemas & riwayat belanja</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={onOpenAddress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="location-outline" size={20} color="#D91E28" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Daftar Alamat & Cabang Pickup</Text>
              <Text style={styles.menuSub} numberOfLines={1}>
                {user?.alamat || 'Atur alamat kirim dan toko favoritmu'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Voucher Saya', 'Anda memiliki voucher gratis ongkir dan diskon 15%')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#FEFCE8' }]}>
              <Ionicons name="ticket-outline" size={20} color="#CA8A04" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Voucher & Kupon Saya</Text>
              <Text style={styles.menuSub}>Klaim promo diskon & gratis ongkir</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Menu Section: Bantuan & Info */}
        <Text style={styles.sectionHeaderTitle}>Pusat Bantuan & Kebijakan</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Pusat Bantuan', 'Hubungi WhatsApp Official Store di 0895-2388-88200')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Hubungi Layanan Pelanggan</Text>
              <Text style={styles.menuSub}>Layanan respon cepat 24 jam</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Tentang Official Store', 'Aplikasi Official Store v1.0.0 - Bumbu, Saus & Kebutuhan Dapur.')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8FAFC' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#64748B" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Tentang Aplikasi</Text>
              <Text style={styles.menuSub}>Versi 1.0.0 (Official Release)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button (if logged in) */}
        {isLoggedIn && (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogoutConfirm}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={styles.logoutText}>Keluar Akun</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  /* Top Red Header matching Promo screen */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#D91E28',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#FEF08A',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: COLORS.textDark,
    fontSize: 10,
    fontWeight: '800',
  },
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  /* Profile Header */
  profileHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  userMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  vipBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vipBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
  userPhoneText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  /* Guest Card */
  guestBox: {
    marginBottom: 16,
  },
  guestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircleGuest: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  guestTextWrap: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  guestSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  loginBtn: {
    backgroundColor: '#D91E28',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#D91E28',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  /* Stats Strip */
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  /* Menu Section */
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  menuSub: {
    fontSize: 11,
    color: '#64748B',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 4,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
});
