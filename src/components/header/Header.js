import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Header({
  storeSettings = null,
  searchQuery,
  setSearchQuery,
  cartCount = 0,
  openCart,
  openChat,
  openNotification,
  openAddress,
  selectedAddress,
  isScrolled,
  openSearch,
  activeTab = 'home',
  setActiveTab = () => {},
  user = null,
  onOpenAuth = () => {},
  favoriteCount = 0,
  onOpenAdmin = () => {},
  openPpob = () => {},
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isScrolled]);

  const navTabs = [
    { id: 'home', label: 'Beranda', icon: 'home-outline' },
    { id: 'belanja', label: 'Belanja', icon: 'storefront-outline' },
    { id: 'ppob', label: 'Pulsa & PPOB', icon: 'flash-outline' },
    { id: 'promo', label: 'Promo Spesial', icon: 'pricetag-outline' },
    { id: 'pesanan', label: 'Pesanan Saya', icon: 'document-text-outline' },
    { id: 'wishlist', label: 'Wishlist', icon: 'heart-outline' },
    { id: 'akun', label: 'Akun Saya', icon: 'person-outline' },
  ];

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        {/* Top Desktop Gradient Header */}
        <LinearGradient
          colors={['#B91C1C', '#D91E28', '#EF4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.desktopHeaderBackground}
        >
          <View style={styles.desktopInnerContent}>
            {/* Left: Brand Logo & Delivery Selector */}
            <View style={styles.desktopLeftSection}>
              <TouchableOpacity
                style={styles.brandLogoContainer}
                onPress={() => setActiveTab('home')}
                activeOpacity={0.8}
              >
                <View style={styles.brandIconCircle}>
                  <Image
                    source={
                      storeSettings?.logo_url && (storeSettings.logo_url.startsWith('http') || storeSettings.logo_url.startsWith('data:'))
                        ? { uri: storeSettings.logo_url }
                        : require('../../../assets/Offical Store.png')
                    }
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={styles.brandTitle}>
                    {(storeSettings?.nama_toko || 'OFFICIAL STORE').toUpperCase()}
                  </Text>
                  <Text style={styles.brandSubtitle} numberOfLines={1}>
                    {storeSettings?.slogan || 'Supermarket Belanja Online'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Delivery Address Dropdown */}
              <TouchableOpacity
                style={styles.desktopAddressBox}
                onPress={openAddress}
                activeOpacity={0.8}
              >
                <Ionicons name="location" size={16} color="#FFE4E6" />
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.desktopAddressLabel}>Dikirim ke:</Text>
                  <Text style={styles.desktopAddressValue} numberOfLines={1}>
                    {selectedAddress ? selectedAddress.title : 'Pilih Alamat Kirim'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Center: Search Bar */}
            <View style={styles.desktopSearchSection}>
              <TouchableOpacity
                style={styles.desktopSearchBar}
                onPress={openSearch}
                activeOpacity={0.9}
              >
                <Ionicons name="search-outline" size={20} color={COLORS.textGray} style={{ marginRight: 8 }} />
                <Text style={styles.desktopSearchPlaceholder} numberOfLines={1}>
                  {searchQuery || 'Cari bumbu Aida, saus Swan, minyak goreng...'}
                </Text>
                <View style={styles.searchButtonBadge}>
                  <Text style={styles.searchButtonText}>Cari</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Right: Actions & User Auth */}
            <View style={styles.desktopRightSection}>
              <TouchableOpacity style={styles.desktopActionBtn} onPress={openChat} activeOpacity={0.7}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.white} />
                <Text style={styles.desktopActionLabel}>Chat</Text>
                <View style={styles.desktopBadge}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.desktopActionBtn} onPress={openNotification} activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
                <Text style={styles.desktopActionLabel}>Notifikasi</Text>
                <View style={styles.desktopBadge}>
                  <Text style={styles.badgeText}>6</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.desktopActionBtn}
                onPress={() => setActiveTab('wishlist')}
                activeOpacity={0.7}
              >
                <Ionicons name="heart-outline" size={22} color={COLORS.white} />
                <Text style={styles.desktopActionLabel}>Wishlist</Text>
                {favoriteCount > 0 && (
                  <View style={styles.desktopBadge}>
                    <Text style={styles.badgeText}>{favoriteCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {user?.role === 'admin' && (
                <TouchableOpacity
                  style={styles.desktopActionBtn}
                  onPress={onOpenAdmin}
                  activeOpacity={0.7}
                >
                  <Ionicons name="settings-outline" size={22} color={COLORS.white} />
                  <Text style={styles.desktopActionLabel}>Admin</Text>
                </TouchableOpacity>
              )}

              {/* DigiFlazz PPOB Quick Button */}
              <TouchableOpacity style={styles.desktopPpobHeaderBtn} onPress={openPpob} activeOpacity={0.85}>
                <Ionicons name="flash" size={18} color="#F59E0B" />
                <Text style={styles.desktopPpobHeaderBtnText}>Pulsa & PPOB</Text>
              </TouchableOpacity>

              {/* Cart Button */}
              <TouchableOpacity style={styles.desktopCartBtn} onPress={openCart} activeOpacity={0.85}>
                <Ionicons name="bag-handle" size={20} color="#D91E28" />
                <Text style={styles.desktopCartBtnText}>Keranjang</Text>
                {cartCount > 0 && (
                  <View style={styles.desktopCartBadge}>
                    <Text style={styles.desktopCartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* User Account / Login */}
              {user ? (
                <TouchableOpacity
                  style={styles.desktopUserBtn}
                  onPress={() => setActiveTab('akun')}
                  activeOpacity={0.8}
                >
                  <View style={styles.desktopUserAvatar}>
                    <Ionicons name="person" size={16} color="#D91E28" />
                  </View>
                  <Text style={styles.desktopUserName} numberOfLines={1}>
                    {user.namaLengkap || user.phone}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.desktopLoginBtn} onPress={onOpenAuth} activeOpacity={0.85}>
                  <Text style={styles.desktopLoginBtnText}>Masuk / Daftar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Secondary Navigation Links Bar */}
        <View style={styles.desktopNavRow}>
          <View style={styles.desktopNavInner}>
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.desktopNavItem, isActive && styles.desktopNavItemActive]}
                  onPress={() => {
                    if (tab.id === 'ppob') {
                      openPpob();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={isActive ? '#D91E28' : '#475569'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.desktopNavText, isActive && styles.desktopNavTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  /* MOBILE HEADER VIEW */
  return (
    <LinearGradient
      colors={isScrolled ? ['#D91E28', '#DC2626'] : ['#B91C1C', '#D91E28', '#EF4444', '#F8FAFC']}
      locations={isScrolled ? [0, 1] : [0, 0.45, 0.85, 1]}
      style={[styles.headerBackground, isScrolled && styles.headerCompact]}
    >
      {isScrolled ? (
        /* COMPACT / COLLAPSED HEADER STATE (On Scroll Down) */
        <View style={styles.compactRow}>
          <TouchableOpacity style={styles.compactSearchBar} onPress={openSearch} activeOpacity={0.9}>
            <Ionicons name="search-outline" size={18} color={COLORS.textGray} style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder} numberOfLines={1}>
              {searchQuery || 'beli dancow fortigro'}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionRowCompact}>
            <TouchableOpacity style={styles.iconBtn} onPress={openChat} activeOpacity={0.7}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.white} />
              <View style={styles.yellowBadge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={openNotification} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
              <View style={styles.yellowBadge}>
                <Text style={styles.badgeText}>6</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={openCart} activeOpacity={0.7}>
              <Ionicons name="bag-handle-outline" size={22} color={COLORS.white} />
              {cartCount > 0 && (
                <View style={styles.yellowBadge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* FULL / EXPANDED HEADER STATE (At Top) */
        <View>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.addressContainer}
              onPress={openAddress}
              activeOpacity={0.7}
            >
              <Text style={styles.addressLabel}>
                {selectedAddress
                  ? selectedAddress.isPickup
                    ? 'Ambil di toko:'
                    : 'Alamat kirim:'
                  : 'Lokasi Pengiriman:'}
              </Text>
              <View style={styles.addressSelector}>
                <Text style={styles.addressTitle}>
                  {selectedAddress ? selectedAddress.title : 'Belum Ada Alamat'}
                </Text>
                {selectedAddress?.isPickup ? (
                  <View style={[styles.utamaBadge, { backgroundColor: 'rgba(2, 132, 199, 0.9)' }]}>
                    <Text style={styles.utamaText}>Pickup</Text>
                  </View>
                ) : (
                  selectedAddress?.isUtama && (
                    <View style={styles.utamaBadge}>
                      <Text style={styles.utamaText}>Utama</Text>
                    </View>
                  )
                )}
                <Ionicons name="chevron-down" size={16} color={COLORS.white} />
              </View>
              <Text style={styles.addressSub} numberOfLines={1}>
                {selectedAddress
                  ? selectedAddress.addressLine1
                  : 'Masuk / pilih lokasi pengiriman Anda'}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              {user?.role === 'admin' && (
                <TouchableOpacity
                  onPress={onOpenAdmin}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.22)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="settings-outline" size={14} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>Admin</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.iconBtn} onPress={openChat} activeOpacity={0.7}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.white} />
                <View style={styles.yellowBadge}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} onPress={openNotification} activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
                <View style={styles.yellowBadge}>
                  <Text style={styles.badgeText}>6</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} onPress={openCart} activeOpacity={0.7}>
                <Ionicons name="bag-handle-outline" size={22} color={COLORS.white} />
                {cartCount > 0 && (
                  <View style={styles.yellowBadge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchRow}>
            <TouchableOpacity style={styles.searchBar} onPress={openSearch} activeOpacity={0.9}>
              <Ionicons name="search-outline" size={20} color={COLORS.textGray} style={styles.searchIcon} />
              <Text style={styles.searchPlaceholder} numberOfLines={1}>
                {searchQuery || 'vitamin untuk anak'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.squareIconBtn} activeOpacity={0.8}>
              <Ionicons name="scan-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.squareIconBtn} activeOpacity={0.8}>
              <Ionicons name="heart-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Desktop Header Styles
  desktopContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 1000,
  },
  desktopHeaderBackground: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  desktopInnerContent: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  desktopLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  brandLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    color: '#FEE2E2',
    fontSize: 10,
    fontWeight: '600',
  },
  desktopAddressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    maxWidth: 180,
  },
  desktopAddressLabel: {
    color: '#FEE2E2',
    fontSize: 9,
    fontWeight: '500',
  },
  desktopAddressValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  desktopSearchSection: {
    flex: 1,
    maxWidth: 520,
  },
  desktopSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 4,
    height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  desktopSearchPlaceholder: {
    flex: 1,
    color: COLORS.textGray,
    fontSize: 14,
  },
  searchButtonBadge: {
    backgroundColor: '#D91E28',
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  desktopRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  desktopActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 4,
  },
  desktopActionLabel: {
    color: '#FEE2E2',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  desktopBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.yellowBadge,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  desktopCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  desktopCartBtnText: {
    color: '#D91E28',
    fontWeight: '800',
    fontSize: 13,
  },
  desktopCartBadge: {
    backgroundColor: '#D91E28',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  desktopCartBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  desktopUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    maxWidth: 130,
  },
  desktopUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopUserName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  desktopLoginBtn: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopLoginBtnText: {
    color: '#991B1B',
    fontWeight: '800',
    fontSize: 12,
  },
  desktopNavRow: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 24,
  },
  desktopNavInner: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  desktopNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  desktopNavItemActive: {
    borderBottomColor: '#D91E28',
    backgroundColor: '#FEF2F2',
  },
  desktopNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  desktopNavTextActive: {
    color: '#D91E28',
    fontWeight: '800',
  },

  // Mobile Header Styles
  headerBackground: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    zIndex: 100,
  },
  headerCompact: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchPlaceholder: {
    color: COLORS.textMuted,
    fontSize: 14,
    flex: 1,
  },
  actionRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressContainer: {
    flex: 1,
    marginRight: 8,
  },
  addressLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginBottom: 2,
  },
  addressSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  addressTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  utamaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  utamaText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  addressSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  iconBtn: {
    position: 'relative',
    padding: 4,
  },
  yellowBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: COLORS.yellowBadge,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: COLORS.textDark,
    fontSize: 10,
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  squareIconBtn: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  desktopPpobHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 6,
    gap: 6,
  },
  desktopPpobHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

