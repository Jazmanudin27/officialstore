import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  Linking,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const INITIAL_CONVERSATIONS = [
  {
    id: 'cs_official',
    initials: 'CS',
    bgColor: '#D91E28',
    storeName: 'Official Store Customer Service',
    badge: 'Official CS',
    date: 'Hari Ini',
    lastMessage: 'Halo! Ada yang bisa kami bantu seputar produk Bumbu Aida & Saus Swan?',
    unreadCount: 1,
    onlineStatus: 'Online (Balas Cepat)',
    messages: [
      {
        id: 'm1',
        sender: 'cs',
        text: 'Selamat datang di Layanan Pelanggan Official Store Tasikmalaya! 👋',
        time: '09:00',
      },
      {
        id: 'm2',
        sender: 'cs',
        text: 'Ada yang bisa kami bantu seputar stok Bumbu Cabai Aida, Saus Swan, pengiriman, atau status pesanan Anda?',
        time: '09:01',
      },
    ],
  },
  {
    id: 'cab_perintis',
    initials: 'P158',
    bgColor: '#0284C7',
    storeName: 'Cabang Perintis 158 (Pusat)',
    badge: 'Toko Cabang',
    date: 'Kemarin',
    lastMessage: 'Pesanan Ambil di Toko (Pick-Up) siap diambil pukul 07:00 - 22:00 WIB.',
    unreadCount: 0,
    onlineStatus: 'Buka • 07:00 - 22:00',
    messages: [
      {
        id: 'm1',
        sender: 'cs',
        text: 'Halo Kak! Cabang Perintis 158 siap melayani pengiriman instan & pick-up.',
        time: 'Kemarin',
      },
    ],
  },
  {
    id: 'bantuan_pesanan',
    initials: 'BP',
    bgColor: '#16A34A',
    storeName: 'Bantuan Pengiriman & Kurir',
    badge: 'Logistik',
    date: '2 Hari lalu',
    lastMessage: 'Estimasi pengiriman area Tasikmalaya adalah 1-3 jam (Kurir Toko).',
    unreadCount: 0,
    onlineStatus: 'Kurir Siap Antar',
    messages: [
      {
        id: 'm1',
        sender: 'cs',
        text: 'Layanan Bantuan Kurir Official Store. Silakan tanyakan kendala lokasi atau waktu pengiriman Anda.',
        time: '2 Hari lalu',
      },
    ],
  },
];

export default function ChatScreen({ visible, onClose }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'cs', 'store'
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (selectedChat) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [selectedChat, selectedChat?.messages?.length]);

  const handleOpenWhatsApp = () => {
    const waUrl = 'https://wa.me/62895238888200?text=Halo%20Admin%20Official%20Store%20Tasikmalaya,%20saya%20ingin%20bertanya%20seputar%20pesanan%20saya.';
    Linking.openURL(waUrl).catch(() => {
      alert('Gagal membuka WhatsApp. Nomor CS: 0895-2388-88200');
    });
  };

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim() || !selectedChat) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...selectedChat.messages, newMsg];
    const updatedChat = {
      ...selectedChat,
      lastMessage: text.trim(),
      messages: updatedMessages,
    };

    setSelectedChat(updatedChat);
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedChat.id ? updatedChat : c))
    );
    if (!textToSend) setInputText('');

    // Trigger Instant CS Auto-Reply Bot
    setTimeout(() => {
      let botReplyText = 'Terima kasih telah menghubungi Customer Service Official Store. Pesan Anda telah kami terima dan tim admin akan segera merespon secara langsung.';
      const lower = text.toLowerCase();

      if (lower.includes('status') || lower.includes('pesanan') || lower.includes('resi') || lower.includes('dikirim')) {
        botReplyText = '📦 Untuk melacak status pesanan Anda secara real-time, Anda dapat membuka menu "Pesanan Saya" di halaman akun. Tim kurir Official Store sedang memproses pengantaran tepat waktu.';
      } else if (lower.includes('bumbu') || lower.includes('aida') || lower.includes('saus') || lower.includes('swan') || lower.includes('stok')) {
        botReplyText = '🌶️ Produk Bumbu Cabai Asli Aida & Saus Swan saat ini **Stok Ready** dengan kualitas segar langsung dari pabrik Tasikmalaya. Dapatkan juga potongan voucher diskon khusus di aplikasi!';
      } else if (lower.includes('alamat') || lower.includes('lokasi') || lower.includes('toko') || lower.includes('cabang')) {
        botReplyText = '📍 Toko Pusat Official Store berlokasi di Jl. Perintis Kemerdekaan No. 158, Kawalu, Tasikmalaya. Kami buka setiap hari pukul 07:00 - 22:00 WIB.';
      } else if (lower.includes('ongkir') || lower.includes('bayar') || lower.includes('qris') || lower.includes('midtrans')) {
        botReplyText = '💳 Kami mendukung pembayaran otomatis via QRIS (Gopay/OVO/Dana/ShopeePay), Transfer Bank (BCA/BRI/BNI/Mandiri), dan Cash. Gratis Ongkir tersedia untuk wilayah Tasikmalaya!';
      }

      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'cs',
        text: botReplyText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, botMsg];
      const finalChat = {
        ...updatedChat,
        lastMessage: botReplyText,
        messages: finalMessages,
      };

      setSelectedChat(finalChat);
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedChat.id ? finalChat : c))
      );
    }, 800);
  };

  const filteredConversations = conversations.filter((c) => {
    const matchSearch =
      c.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'cs') return matchSearch && c.id === 'cs_official';
    if (activeTab === 'store') return matchSearch && c.id !== 'cs_official';
    return matchSearch;
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {selectedChat ? (
          /* ================= DETAIL CHAT CONVERSATION ROOM ================= */
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header Detail Chat */}
            <View style={styles.chatDetailHeader}>
              <TouchableOpacity
                onPress={() => setSelectedChat(null)}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
              </TouchableOpacity>

              <View
                style={[
                  styles.avatarSmall,
                  { backgroundColor: selectedChat.bgColor || '#D91E28' },
                ]}
              >
                <Text style={styles.avatarTextSmall}>{selectedChat.initials}</Text>
              </View>

              <View style={styles.chatDetailHeaderInfo}>
                <Text style={styles.chatDetailHeaderName} numberOfLines={1}>
                  {selectedChat.storeName}
                </Text>
                <Text style={styles.chatDetailHeaderStatus}>
                  🟢 {selectedChat.onlineStatus}
                </Text>
              </View>

              {/* Direct WhatsApp Call Button */}
              <TouchableOpacity
                onPress={handleOpenWhatsApp}
                style={styles.waHeaderBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                <Text style={styles.waHeaderBtnText}>WA Live</Text>
              </TouchableOpacity>
            </View>

            {/* Chat Bubble Scroll Window */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messageScrollView}
              contentContainerStyle={styles.messageScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.securityNoticeBox}>
                <Ionicons name="shield-checkmark" size={16} color="#16A34A" />
                <Text style={styles.securityNoticeText}>
                  Percakapan terlindungi. Tim CS Official Store siap membantu Anda 24/7.
                </Text>
              </View>

              {selectedChat.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.bubbleWrapper,
                      isUser ? styles.bubbleUserWrapper : styles.bubbleCsWrapper,
                    ]}
                  >
                    <View
                      style={[
                        styles.bubbleContainer,
                        isUser ? styles.bubbleUser : styles.bubbleCs,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          isUser ? styles.bubbleUserText : styles.bubbleCsText,
                        ]}
                      >
                        {msg.text}
                      </Text>
                      <Text
                        style={[
                          styles.bubbleTime,
                          isUser ? styles.bubbleUserTime : styles.bubbleCsTime,
                        ]}
                      >
                        {msg.time}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Quick Pill Questions Bar */}
            <View style={styles.quickPillsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
                <TouchableOpacity
                  style={styles.pillBtn}
                  onPress={() => handleSendMessage('Tanya status pesanan terbaru')}
                >
                  <Text style={styles.pillText}>📦 Status Pesanan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pillBtn}
                  onPress={() => handleSendMessage('Apakah stok Bumbu Aida ready?')}
                >
                  <Text style={styles.pillText}>🌶️ Stok Bumbu Aida</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pillBtn}
                  onPress={() => handleSendMessage('Dimana lokasi alamat toko cabang?')}
                >
                  <Text style={styles.pillText}>📍 Alamat Toko</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pillBtn}
                  onPress={() => handleSendMessage('Metode pembayaran apa saja yang tersedia?')}
                >
                  <Text style={styles.pillText}>💳 Metode Bayar</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Bottom Text Input Row */}
            <View style={styles.inputBarContainer}>
              <TouchableOpacity onPress={handleOpenWhatsApp} style={styles.attachBtn}>
                <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
              </TouchableOpacity>

              <TextInput
                style={styles.chatTextInput}
                placeholder="Ketik pesan Anda di sini..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendMessage()}
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  !inputText.trim() && { backgroundColor: '#CBD5E1' },
                ]}
                onPress={() => handleSendMessage()}
                disabled={!inputText.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        ) : (
          /* ================= INBOX CONVERSATION LIST ================= */
          <View style={styles.container}>
            {/* Top Header Row */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Kotak Masuk Chat</Text>
              <TouchableOpacity onPress={handleOpenWhatsApp} style={styles.waTopIconBtn}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              </TouchableOpacity>
            </View>

            {/* Direct WhatsApp Banner Card */}
            <TouchableOpacity
              style={styles.waBannerCard}
              onPress={handleOpenWhatsApp}
              activeOpacity={0.85}
            >
              <View style={styles.waBannerIconBox}>
                <Ionicons name="logo-whatsapp" size={26} color="#FFFFFF" />
              </View>
              <View style={styles.waBannerTextWrap}>
                <Text style={styles.waBannerTitle}>Hubungi CS via WhatsApp Live</Text>
                <Text style={styles.waBannerSub}>
                  Respon tercepat 1-on-1 dengan Admin Official Store (0895-2388-88200)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#16A34A" />
            </TouchableOpacity>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari percakapan atau pesan..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Sub Navigation Tabs */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'all' && styles.tabActive]}
                onPress={() => setActiveTab('all')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                  Semua
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'cs' && styles.tabActive]}
                onPress={() => setActiveTab('cs')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'cs' && styles.tabTextActive]}>
                  Customer Service
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'store' && styles.tabActive]}
                onPress={() => setActiveTab('store')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'store' && styles.tabTextActive]}>
                  Toko Cabang
                </Text>
              </TouchableOpacity>
            </View>

            {/* Chat List Content */}
            <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
              {filteredConversations.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  style={styles.chatItem}
                  onPress={() => setSelectedChat(chat)}
                  activeOpacity={0.7}
                >
                  {/* Circle Avatar with Initials */}
                  <View style={[styles.avatar, { backgroundColor: chat.bgColor || '#EF4444' }]}>
                    <Text style={styles.avatarText}>{chat.initials}</Text>
                  </View>

                  {/* Info Container */}
                  <View style={styles.chatInfo}>
                    <View style={styles.titleRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 }}>
                        <Text style={styles.storeName} numberOfLines={1}>
                          {chat.storeName}
                        </Text>
                        {chat.badge && (
                          <View style={styles.badgeBox}>
                            <Text style={styles.badgeText}>{chat.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.dateText}>{chat.date}</Text>
                    </View>

                    <View style={styles.msgRow}>
                      <Text style={styles.lastMsgText} numberOfLines={1}>
                        {chat.lastMessage}
                      </Text>
                      {chat.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginLeft: 12,
    flex: 1,
  },
  waTopIconBtn: {
    padding: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    paddingTop: 12,
  },
  waBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  waBannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  waBannerTextWrap: {
    flex: 1,
  },
  waBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  waBannerSub: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
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
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    borderWidth: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#D91E28',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#D91E28',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
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
  },
  badgeBox: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D91E28',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMsgText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#D91E28',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  /* Detail Chat Room Styles */
  chatDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  avatarTextSmall: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  chatDetailHeaderInfo: {
    flex: 1,
  },
  chatDetailHeaderName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatDetailHeaderStatus: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  waHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  waHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  messageScrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messageScrollContent: {
    padding: 16,
  },
  securityNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    gap: 6,
  },
  securityNoticeText: {
    fontSize: 12,
    color: '#166534',
    textAlign: 'center',
  },
  bubbleWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  bubbleUserWrapper: {
    justifyContent: 'flex-end',
  },
  bubbleCsWrapper: {
    justifyContent: 'flex-start',
  },
  bubbleContainer: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#D91E28',
    borderBottomRightRadius: 2,
  },
  bubbleCs: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleUserText: {
    color: '#FFFFFF',
  },
  bubbleCsText: {
    color: '#0F172A',
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  bubbleUserTime: {
    color: '#FECDD3',
  },
  bubbleCsTime: {
    color: '#94A3B8',
  },
  quickPillsRow: {
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pillBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  attachBtn: {
    padding: 6,
  },
  chatTextInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D91E28',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

