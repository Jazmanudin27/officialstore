import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Header({ searchQuery, setSearchQuery, cartCount, openCart, isScrolled }) {
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isScrolled]);

  return (
    <LinearGradient
      colors={isScrolled ? ['#D91E28', '#DC2626'] : ['#B91C1C', '#D91E28', '#EF4444', '#F8FAFC']}
      locations={isScrolled ? [0, 1] : [0, 0.45, 0.85, 1]}
      style={[styles.headerBackground, isScrolled && styles.headerCompact]}
    >
      {isScrolled ? (
        /* COMPACT / COLLAPSED HEADER STATE (On Scroll Down) */
        <View style={styles.compactRow}>
          {/* Search Input inline left */}
          <View style={styles.compactSearchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.textGray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="beli dancow fortigro"
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Action Icons inline right */}
          <View style={styles.actionRowCompact}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.white} />
              <View style={styles.yellowBadge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
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
          {/* Top Address & Action Bar */}
          <View style={styles.topRow}>
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Alamat kirim:</Text>
              <TouchableOpacity style={styles.addressSelector} activeOpacity={0.7}>
                <Text style={styles.addressTitle}>Rumah</Text>
                <View style={styles.utamaBadge}>
                  <Text style={styles.utamaText}>Utama</Text>
                </View>
                <Ionicons name="chevron-down" size={16} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.addressSub} numberOfLines={1}>
                Jl. Pasir Bokor, Kp. Gunung Jambe,...
              </Text>
            </View>

            {/* Right Action Icons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.white} />
                <View style={styles.yellowBadge}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
                <View style={styles.yellowBadge}>
                  <Text style={styles.badgeText}>4</Text>
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

          {/* Search Input Bar with Scan & Heart Icons */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color={COLORS.textGray} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="vitamin untuk anak"
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

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
  searchInput: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 14,
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
});
