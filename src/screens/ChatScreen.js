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

export default function ChatScreen({ visible, onClose }) {
  const [activeTab, setActiveTab] = useState('transaksi');
  const [searchQuery, setSearchQuery] = useState('');

  const chatList = [
    {
      id: '1',
      initials: 'CI',
      storeName: 'Alfamart - CIBUNIGEULIS',
      date: '15/08/2026',
      lastMessage: 'Gambar',
      isImage: true,
      unread: false,
    },
    {
      id: '2',
      initials: 'OS',
      storeName: 'Official Store Customer Service',
      date: '10/08/2026',
      lastMessage: 'Halo, pesanan Anda sedang kami siapkan ya Kak!',
      isImage: false,
      unread: true,
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Row */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kotak Masuk</Text>
          {/* 3D Chat Bubble Graphic Icon */}
          <View style={styles.chatIconGraphic}>
            <Ionicons name="chatbubbles" size={28} color="#EF4444" />
          </View>
        </View>

        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari toko/brand/pesan"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Sub Navigation Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'transaksi' && styles.tabActive]}
              onPress={() => setActiveTab('transaksi')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'transaksi' && styles.tabTextActive,
                ]}
              >
                Transaksi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'store' && styles.tabActive]}
              onPress={() => setActiveTab('store')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabText, activeTab === 'store' && styles.tabTextActive]}
              >
                Official Store
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chat List Content */}
          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            {chatList.map((chat) => (
              <TouchableOpacity key={chat.id} style={styles.chatItem} activeOpacity={0.7}>
                {/* Circle Avatar with Initials */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{chat.initials}</Text>
                </View>

                {/* Info Container */}
                <View style={styles.chatInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.storeName}>{chat.storeName}</Text>
                    <Text style={styles.dateText}>{chat.date}</Text>
                  </View>

                  <View style={styles.msgRow}>
                    {chat.isImage ? (
                      <View style={styles.imageMsgBox}>
                        <Ionicons name="image-outline" size={16} color="#64748B" />
                        <Text style={styles.lastMsgText}>Gambar</Text>
                      </View>
                    ) : (
                      <Text style={styles.lastMsgText} numberOfLines={1}>
                        {chat.lastMessage}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginLeft: 12,
    flex: 1,
  },
  chatIconGraphic: {
    paddingRight: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 40,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0284C7',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  listScroll: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  chatInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageMsgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastMsgText: {
    fontSize: 13,
    color: '#64748B',
  },
});
