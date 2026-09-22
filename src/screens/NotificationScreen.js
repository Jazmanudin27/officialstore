import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function NotificationScreen({ visible, onClose }) {
  const [activeTab, setActiveTab] = useState('promo');

  const infoList = [
    {
      id: '1',
      title: '✨ RAMBUT SEHAT, BELANJA HEMAT!',
      date: 'Sep 21',
      subtitle: 'Beli 1 Pantene MRCL H.VIT 5S, dapat potongan Rp4.500!',
    },
    {
      id: '2',
      title: 'Jazmanudin',
      date: 'Sep 10',
      subtitle: 'Barang kamu aman di keranjang, check out sekarang yuk!',
    },
    {
      id: '3',
      title: 'Jazmanudin',
      date: 'Agu 06',
      subtitle: 'Barang kamu aman di keranjang, check out sekarang yuk!',
    },
  ];

  const promoList = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
      title: 'Cari minuman teh nikmat untuk temani hari~..',
      subtitle: 'Amankan diskon teh sekarang juga! 📦',
      timestamp: 'Sep 22, 09:30 AM',
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1556742049-0a670fc8078a?w=800&q=80',
      title: 'Hematnya pas, belanjanya puas 🛒',
      subtitle: 'Pakai Kartu Kredit atau Debit BRI & dapatkan potongan Rp35.000.',
      timestamp: 'Sep 22, 09:30 AM',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Red Top Header Row */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pemberitahuan</Text>
        </View>

        {/* Tabs Row */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'promo' && styles.tabActive]}
            onPress={() => setActiveTab('promo')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'promo' && styles.tabTextActive,
                ]}
              >
                Promo
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'info' && styles.tabTextActive,
                ]}
              >
                Info
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Main List ScrollView */}
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {activeTab === 'info' ? (
            /* INFO TAB LIST */
            <View style={styles.infoListWrap}>
              {infoList.map((item) => (
                <View key={item.id} style={styles.infoCard}>
                  <View style={styles.infoRowTop}>
                    <Text style={styles.infoTitle}>{item.title}</Text>
                    <Text style={styles.infoDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.infoSub}>{item.subtitle}</Text>
                </View>
              ))}
            </View>
          ) : (
            /* PROMO TAB LIST */
            <View style={styles.promoListWrap}>
              {promoList.map((item) => (
                <View key={item.id} style={styles.promoCard}>
                  <Image source={{ uri: item.image }} style={styles.bannerImg} />
                  <View style={styles.promoContent}>
                    <Text style={styles.promoTitle}>{item.title}</Text>
                    <Text style={styles.promoSub}>{item.subtitle}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.promoTimestamp}>{item.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0284C7',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  badge: {
    backgroundColor: '#D91E28',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
  },
  /* INFO STYLES */
  infoListWrap: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  infoCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  infoDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  infoSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  /* PROMO CARD STYLES */
  promoListWrap: {
    gap: 14,
  },
  promoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  bannerImg: {
    width: '100%',
    height: 160,
    backgroundColor: '#CBD5E1',
  },
  promoContent: {
    padding: 14,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  promoSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 10,
  },
  promoTimestamp: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
