import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function MemberCard() {
  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row with Teal Gradient Effect */}
      <View style={styles.topTealHeader}>
        <Text style={styles.greetingText}>Hai, Jazmanudin</Text>
        <TouchableOpacity style={styles.memberBadge} activeOpacity={0.8}>
          <Ionicons name="trophy-outline" size={14} color={COLORS.white} />
          <Text style={styles.memberBadgeText}>Newbie Member</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Main Points Grid */}
      <View style={styles.pointsGrid}>
        {/* A-Poin */}
        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <View style={styles.statHeader}>
            <View style={[styles.coinIcon, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.coinSymbol}>P</Text>
            </View>
            <Text style={styles.statNumber}>11.297</Text>
          </View>
          <Text style={styles.statLabel}>Tukar A-Poin</Text>
        </TouchableOpacity>

        {/* Voucher */}
        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <View style={styles.statHeader}>
            <Ionicons name="ticket-outline" size={18} color="#F59E0B" />
            <Text style={styles.statNumber}>46</Text>
          </View>
          <Text style={styles.statLabel}>Voucher</Text>
        </TouchableOpacity>

        {/* Stamp */}
        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <View style={styles.statHeader}>
            <Ionicons name="pricetag-outline" size={18} color="#F59E0B" />
            <Text style={styles.statNumber}>0</Text>
          </View>
          <Text style={styles.statLabel}>Stamp</Text>
        </TouchableOpacity>

        {/* Star */}
        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <View style={styles.statHeader}>
            <Ionicons name="star-outline" size={18} color="#F59E0B" />
            <Text style={styles.statNumber}>2</Text>
          </View>
          <Text style={styles.statLabel}>Star</Text>
        </TouchableOpacity>
      </View>

      {/* Yellow Warning Banner for Voucher Expiry */}
      <View style={styles.warningBanner}>
        <View style={styles.warningPointer} />
        <Text style={styles.warningText}>
          <Text style={{ fontWeight: '800', color: '#B91C1C' }}>1 voucher</Text> segera kedaluwarsa
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Bottom Wallet & Barcode Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.gopayBtn} activeOpacity={0.7}>
          <Ionicons name="wallet-outline" size={18} color="#0284C7" />
          <Text style={styles.gopayText}>Hubungkan Akun Gopay</Text>
          <Ionicons name="chevron-forward" size={14} color="#0284C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.barcodeBtn} activeOpacity={0.8}>
          <Ionicons name="barcode-outline" size={18} color="#0284C7" />
          <Text style={styles.barcodeText}>Barcode Member</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  topTealHeader: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  greetingText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  memberBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  pointsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  coinIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinSymbol: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  statNumber: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.blueAccent,
    fontSize: 11,
    fontWeight: '500',
  },
  warningBanner: {
    backgroundColor: '#FEF9C3',
    marginHorizontal: 12,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FDE047',
    position: 'relative',
  },
  warningPointer: {
    position: 'absolute',
    top: -5,
    left: '38%',
    width: 10,
    height: 10,
    backgroundColor: '#FEF9C3',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#FDE047',
    transform: [{ rotate: '45deg' }],
  },
  warningText: {
    color: '#854D0E',
    fontSize: 11,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  gopayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gopayText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  barcodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#0284C7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  barcodeText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '800',
  },
});
