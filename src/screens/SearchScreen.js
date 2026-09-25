import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function SearchScreen({ visible, onClose, onSelectKeyword }) {
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState(['Aida Cabai Bubuk 500gr', 'Saus Swan Pouch 500gr']);

  const smartSuggestions = [
    'Cabai Bubuk Aida 500gr',
    'Saus Tomat Swan Botol',
    'Bumbu Tabur Aida Balado',
    'SaosMe Pouch 500gr',
  ];

  const trendingKeywords = [
    'Aida Cabai Bubuk',
    'Saus Swan Botol',
    'SaosMe Pouch 500gr',
    'Bumbu Tabur Balado',
    'Aida Dus 500gr',
    'Saus Tomat Swan',
    'Cabe Pedas Murni',
    'Paket Grosir Bumbu',
    'Aida Kecil 25gr',
    'Bumbu Dapur Tasik',
  ];

  const handleSearchSubmit = (keyword) => {
    if (!keyword) return;
    if (!history.includes(keyword)) {
      setHistory([keyword, ...history]);
    }
    onSelectKeyword(keyword);
    onClose();
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Search Bar with Back Button */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>

          <View style={styles.searchInputBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari Bumbu Aida, Saus Swan, SaosMe..."
              placeholderTextColor={COLORS.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => handleSearchSubmit(searchText)}
              autoFocus
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Smart AI Search Banner */}
          <View style={styles.smartBanner}>
            <View style={styles.smartHeader}>
              <Text style={styles.smartTitle}>Pencarian Produk Official Store ✨</Text>
            </View>
            <Text style={styles.smartSub}>
              Temukan produk bumbu dapur, saus swan, dan cabai bubuk resmi berkualitas tinggi dengan cepat.
            </Text>

            {/* Smart Suggestion Pills */}
            <View style={styles.smartPillContainer}>
              {smartSuggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.smartPill}
                  onPress={() => handleSearchSubmit(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="sparkles" size={14} color="#EC4899" />
                  <Text style={styles.smartPillText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Riwayat Pencarian (Search History) */}
          {history.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Riwayat Pencarian</Text>
                <TouchableOpacity onPress={handleClearHistory}>
                  <Text style={styles.clearText}>Hapus Riwayat</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tagWrap}>
                {history.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyTag}
                    onPress={() => handleSearchSubmit(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.historyTagText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Mini Promo Card Banner */}
          <View style={styles.promoMiniCard}>
            <View style={styles.promoMiniLeft}>
              <Text style={styles.promoTag}>Official Store Promo</Text>
              <Text style={styles.promoTitle}>BUMBU & SAUS SUPER</Text>
            </View>
            <View style={styles.promoMiniRight}>
              <Text style={styles.promoDiscount}>DISKON s.d 50%</Text>
              <Text style={styles.promoCashback}>+ CASHBACK ONGKIR</Text>
            </View>
          </View>

          {/* Sedang Trend 🔥 */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Sedang Trend 🔥</Text>
            <View style={styles.tagWrap}>
              {trendingKeywords.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.trendTag}
                  onPress={() => handleSearchSubmit(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.trendTagText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Kategori Pilihan */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Kategori Pilihan 🛒</Text>
            <View style={styles.tagWrap}>
              {['AIDA', 'SAUS SWAN', 'BUMBU TABUR', 'PREMIUM POUCH', 'SAMBAL CABE', 'SAOSME'].map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.categoryPill}
                  onPress={() => handleSearchSubmit(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryPillText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0,
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 0,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 14,
    borderWidth: 0,
    outlineStyle: 'none',
    outlineWidth: 0,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  smartBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  smartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  smartTitle: {
    color: '#0284C7',
    fontSize: 16,
    fontWeight: '800',
  },
  smartSub: {
    color: COLORS.textGray,
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  smartPillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F472B6',
    gap: 6,
  },
  smartPillText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionContainer: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  clearText: {
    color: COLORS.primaryRed,
    fontSize: 13,
    fontWeight: '700',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyTagText: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '500',
  },
  trendTag: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  trendTagText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  categoryPillText: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '600',
  },
  promoMiniCard: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoMiniLeft: {
    gap: 2,
  },
  promoTag: {
    color: '#FEF08A',
    fontSize: 11,
    fontWeight: '800',
  },
  promoTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  promoMiniRight: {
    alignItems: 'flex-end',
  },
  promoDiscount: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  promoCashback: {
    color: '#FEF08A',
    fontSize: 11,
    fontWeight: '700',
  },
});
