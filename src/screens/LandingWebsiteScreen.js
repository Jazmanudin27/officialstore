import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  SafeAreaView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCTS } from '../data/mockProducts';
import { formatRupiah } from '../utils/formatters';

export default function LandingWebsiteScreen({ onOpenStore, onOpenProductDetail, onOpenAuth }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [activeMenu, setActiveMenu] = useState('home');
  const [emailSubscribe, setEmailSubscribe] = useState('');
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  const featuredProducts = PRODUCTS.slice(0, 6);

  const handleSubscribe = () => {
    if (emailSubscribe.trim().includes('@')) {
      setSubscribedSuccess(true);
      setEmailSubscribe('');
      setTimeout(() => setSubscribedSuccess(false), 4000);
    }
  };

  const handleContactWA = () => {
    const phone = '62895238888200';
    const text = 'Halo Official Store Tasikmalaya! Saya ingin menanyakan tentang produk rempah & saus premium.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Announcement Bar */}
      <View style={styles.announcementBar}>
        <Text style={styles.announcementText}>
          🌾 PURELY TASIKMALAYA • PROMO REMPAH & SAUS PREMIUM KELUARGA • DISKON ONGKIR SELURUH INDONESIA 🌾
        </Text>
      </View>

      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <View style={styles.navContainer}>
          {/* Brand Logo */}
          <TouchableOpacity style={styles.logoGroup} onPress={onOpenStore} activeOpacity={0.85}>
            <View style={styles.logoBadgeIcon}>
              <Ionicons name="nutrition-outline" size={24} color="#2E3A23" />
            </View>
            <View>
              <Text style={styles.logoTitle}>IDUKKI STYLE</Text>
              <Text style={styles.logoSubtitle}>TASIK SPICE & SAUCE</Text>
            </View>
          </TouchableOpacity>

          {/* Nav Links for Desktop */}
          {isDesktop && (
            <View style={styles.navLinksRow}>
              <TouchableOpacity onPress={() => setActiveMenu('home')} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, activeMenu === 'home' && styles.navLinkActive]}>Beranda</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveMenu('shop')} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, activeMenu === 'shop' && styles.navLinkActive]}>Katalog Produk</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveMenu('story')} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, activeMenu === 'story' && styles.navLinkActive]}>Kisah Kami</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveMenu('benefits')} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, activeMenu === 'benefits' && styles.navLinkActive]}>Keunggulan</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveMenu('recipes')} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, activeMenu === 'recipes' && styles.navLinkActive]}>Resep Pilihan</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleContactWA} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Hubungi Kami</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right Header Actions */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity onPress={onOpenStore} style={styles.appStoreBtn} activeOpacity={0.85}>
              <Ionicons name="bag-handle" size={16} color="#FFFFFF" />
              <Text style={styles.appStoreBtnText}>Buka Toko Online</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION (Matching Reference Image "IDUKKI SPICE" Design) */}
        <View style={styles.heroSection}>
          <View style={[styles.heroContainer, isDesktop ? styles.heroDesktopRow : styles.heroMobileCol]}>
            
            {/* Left Hero Content */}
            <View style={isDesktop ? styles.heroLeftDesktop : styles.heroLeftMobile}>
              <View style={styles.taglineBadge}>
                <Ionicons name="sparkles" size={12} color="#4A5D3B" />
                <Text style={styles.taglineText}>PURELY TASIKMALAYA, PERFECTLY PREMIUM</Text>
              </View>

              <Text style={styles.heroTitle}>
                The Rich Aroma{'\n'}
                <Text style={styles.heroTitleHighlight}>of Tasikmalaya</Text>
              </Text>

              <Text style={styles.heroSubtitle}>
                Diolah secara alami dari rempah & cabai asli pilihan pegunungan Tasikmalaya.
                Menghadirkan keharuman pedas gurih, kemurnian aroma, dan kelezatan alami di setiap masakan dapur Anda.
              </Text>

              {/* Shop CTA Button */}
              <TouchableOpacity style={styles.heroCtaBtn} onPress={onOpenStore} activeOpacity={0.88}>
                <Text style={styles.heroCtaText}>BELANJA SEKARANG</Text>
                <Ionicons name="arrow-forward-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* 4 Feature Badges Grid */}
              <View style={styles.heroBadgesGrid}>
                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconCircle}>
                    <Ionicons name="leaf-outline" size={18} color="#2E3A23" />
                  </View>
                  <Text style={styles.badgeText}>100%{'\n'}NATURAL</Text>
                </View>

                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconCircle}>
                    <Ionicons name="navigate-outline" size={18} color="#2E3A23" />
                  </View>
                  <Text style={styles.badgeText}>REMPAH{'\n'}TASIK</Text>
                </View>

                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconCircle}>
                    <Ionicons name="flask-outline" size={18} color="#2E3A23" />
                  </View>
                  <Text style={styles.badgeText}>TANPA{'\n'}PENGAWET</Text>
                </View>

                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconCircle}>
                    <Ionicons name="flame-outline" size={18} color="#2E3A23" />
                  </View>
                  <Text style={styles.badgeText}>AROMA &{'\n'}PEDAS ALAMI</Text>
                </View>
              </View>
            </View>

            {/* Right Hero Visuals / Image Package */}
            <View style={isDesktop ? styles.heroRightDesktop : styles.heroRightMobile}>
              <View style={styles.heroImageWrapper}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=900&q=80' }}
                  style={styles.heroMainImage}
                  resizeMode="cover"
                />
                
                {/* Stamp Seal Badge (Top Right) */}
                <View style={styles.stampSealBadge}>
                  <Ionicons name="ribbon-outline" size={20} color="#2E3A23" />
                  <Text style={styles.stampText}>PURELY TASIK</Text>
                  <Text style={styles.stampSubText}>PREMIUM QUALITY</Text>
                </View>

                {/* Floating Product Highlight Card */}
                <View style={styles.floatingHighlightCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=150&q=80' }}
                      style={{ width: 44, height: 44, borderRadius: 8 }}
                    />
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#1C2417' }}>AIDA CABAI ASLI</Text>
                      <Text style={{ fontSize: 11, color: '#5B6651' }}>Bumbu Cabai Bubuk Murni 500g</Text>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#D91E28', marginTop: 2 }}>Rp 23.500</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

          </View>
        </View>

        {/* BOTTOM VALUE PROPOSITION BAR */}
        <View style={styles.valuePropsBar}>
          <View style={[styles.valuePropsContainer, isDesktop ? styles.valuePropsDesktopRow : styles.valuePropsMobileCol]}>
            <View style={styles.valueItem}>
              <Ionicons name="sparkles-outline" size={22} color="#D4B886" />
              <View>
                <Text style={styles.valueTitle}>REMPAH QUALITY SUPER</Text>
                <Text style={styles.valueSub}>Bahan pilihan dari petani terbaik</Text>
              </View>
            </View>

            <View style={styles.valueDivider} />

            <View style={styles.valueItem}>
              <Ionicons name="car-outline" size={22} color="#D4B886" />
              <View>
                <Text style={styles.valueTitle}>PENGIRIMAN CEPAT & AMAN</Text>
                <Text style={styles.valueSub}>Packing rapi hingga ke tangan Anda</Text>
              </View>
            </View>

            <View style={styles.valueDivider} />

            <View style={styles.valueItem}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#D4B886" />
              <View>
                <Text style={styles.valueTitle}>PEMBAYARAN TERJAMIN</Text>
                <Text style={styles.valueSub}>Transfer, QRIS, & COD Bayar Tempat</Text>
              </View>
            </View>

            <View style={styles.valueDivider} />

            <View style={styles.valueItem}>
              <Ionicons name="heart-outline" size={22} color="#D4B886" />
              <View>
                <Text style={styles.valueTitle}>KEPUASAN PELANGGAN</Text>
                <Text style={styles.valueSub}>Layanan respon cepat & garansi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* OUR STORY SECTION (KISAH KAMI) */}
        <View style={styles.sectionContainer}>
          <View style={[styles.storyRow, isDesktop ? styles.storyDesktopRow : styles.storyMobileCol]}>
            <View style={isDesktop ? styles.storyImageSide : styles.storyImageMobile}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&q=80' }}
                style={styles.storyImage}
                resizeMode="cover"
              />
            </View>

            <View style={isDesktop ? styles.storyTextSide : styles.storyTextMobile}>
              <View style={styles.sectionTagline}>
                <Ionicons name="book-outline" size={14} color="#4A5D3B" />
                <Text style={styles.sectionTaglineText}>OUR STORY & HERITAGE</Text>
              </View>
              <Text style={styles.sectionHeading}>
                Warisan Cita Rasa Pedas & Gurih Sejak Dahulu
              </Text>

              <Text style={styles.storyParagraph}>
                Official Store Tasikmalaya hadir membawa tradisi pengolahan rempah dan saus cabai legendaris. 
                Produk seperti Aida Cabai Bubuk dan Saus Bawang diproduksi dari cabai segar pilihan pegunungan 
                Tasikmalaya tanpa bahan kimia berbahaya.
              </Text>
              <Text style={styles.storyParagraph}>
                Setiap bulir cabai diolah dengan standar kebersihan dan higienitas tinggi untuk memastikan 
                aroma pedas alami, warna merah menggugah selera, dan rasa gurih yang tak tertandingi di setiap sajian kuliner Nusantara.
              </Text>

              <TouchableOpacity style={styles.outlineCtaBtn} onPress={onOpenStore} activeOpacity={0.85}>
                <Text style={styles.outlineCtaText}>JELAJAHI KATALOG LENGKAP</Text>
                <Ionicons name="chevron-forward" size={16} color="#2E3A23" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* FEATURED PRODUCTS SHOWCASE */}
        <View style={styles.productsSection}>
          <View style={styles.productsHeaderCenter}>
            <View style={styles.sectionTagline}>
              <Ionicons name="pricetags-outline" size={14} color="#4A5D3B" />
              <Text style={styles.sectionTaglineText}>PREMIUM SELECTION</Text>
            </View>
            <Text style={styles.sectionHeadingCenter}>Koleksi Produk Terfavorit</Text>
            <Text style={styles.sectionSubCenter}>
              Pilihan bumbu, rempah, dan saus khas Tasikmalaya paling dicari oleh dapur rumah tangga & UMKM Kuliner.
            </Text>
          </View>

          <View style={[styles.productsGrid, isDesktop ? styles.productsGridDesktop : styles.productsGridMobile]}>
            {featuredProducts.map((prod) => (
              <View key={prod.id} style={styles.productCard}>
                <View style={styles.productImageWrap}>
                  <Image source={{ uri: prod.image }} style={styles.productCardImg} resizeMode="cover" />
                  <View style={styles.productBadgeTop}>
                    <Text style={styles.productBadgeText}>{prod.category || 'TERLARIS'}</Text>
                  </View>
                </View>

                <View style={styles.productCardBody}>
                  <Text style={styles.productCardTitle} numberOfLines={1}>{prod.name}</Text>
                  <Text style={styles.productCardDesc} numberOfLines={2}>{prod.description}</Text>

                  <View style={styles.productPriceRow}>
                    <View>
                      <Text style={styles.priceLabel}>Harga Resmi</Text>
                      <Text style={styles.priceAmount}>{formatRupiah(prod.price)}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.buyNowMiniBtn}
                      onPress={() => {
                        if (onOpenProductDetail) onOpenProductDetail(prod);
                        else onOpenStore();
                      }}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.buyNowMiniText}>Beli</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <TouchableOpacity style={styles.heroCtaBtn} onPress={onOpenStore} activeOpacity={0.88}>
              <Text style={styles.heroCtaText}>LIHAT SELURUH PRODUK ({PRODUCTS.length})</Text>
              <Ionicons name="arrow-forward-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* RECIPES & COOKING INSPIRATION SECTION */}
        <View style={styles.recipesSection}>
          <View style={styles.productsHeaderCenter}>
            <View style={styles.sectionTagline}>
              <Ionicons name="restaurant-outline" size={14} color="#4A5D3B" />
              <Text style={styles.sectionTaglineText}>CHEF & KITCHEN INSPIRATION</Text>
            </View>
            <Text style={styles.sectionHeadingCenter}>Inspirasi Resep Khas Tasik</Text>
            <Text style={styles.sectionSubCenter}>
              Kreasi masakan lezat yang lebih mudah & harum menggiurkan menggunakan rempah pilihan kami.
            </Text>
          </View>

          <View style={[styles.recipesGrid, isDesktop ? styles.recipesGridDesktop : styles.recipesGridMobile]}>
            <View style={styles.recipeCard}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80' }} style={styles.recipeImg} />
              <View style={styles.recipeContent}>
                <View style={styles.recipeCategoryBadge}>
                  <Text style={styles.recipeCategoryText}>SEBLAK PEDAS AIDA</Text>
                </View>
                <Text style={styles.recipeTitle}>Seblak Kuah Merah Merona khas Tasik</Text>
                <Text style={styles.recipeDesc}>Perpaduan kerupuk basah, kencur, dan kepedulian Aida Cabai Asli 500g yang menghentak selera.</Text>
              </View>
            </View>

            <View style={styles.recipeCard}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80' }} style={styles.recipeImg} />
              <View style={styles.recipeContent}>
                <View style={styles.recipeCategoryBadge}>
                  <Text style={styles.recipeCategoryText}>BAKSO SAUS BAWANG</Text>
                </View>
                <Text style={styles.recipeTitle}>Bakso Kuah Gurih Saus Bawang Ball</Text>
                <Text style={styles.recipeDesc}>Saus Bawang kental beraroma khas yang menyatu sempurna dalam kuah kaldu sapi hangat.</Text>
              </View>
            </View>

            <View style={styles.recipeCard}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80' }} style={styles.recipeImg} />
              <View style={styles.recipeContent}>
                <View style={styles.recipeCategoryBadge}>
                  <Text style={styles.recipeCategoryText}>BUMBU TABUR SNACK</Text>
                </View>
                <Text style={styles.recipeTitle}>Cimol & Keripik Pedas Gurih Renyah</Text>
                <Text style={styles.recipeDesc}>Taburan bumbu lezat dengan rasa stabil yang pas untuk cemilan harian keluarga dan jualan.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* NEWSLETTER SUBSCRIBE FOOTER BANNER */}
        <View style={styles.newsletterBanner}>
          <View style={styles.newsletterContainer}>
            <Ionicons name="mail-unread-outline" size={36} color="#D4B886" />
            <Text style={styles.newsletterTitle}>Dapatkan Promo Rempah & Resep Terbaru</Text>
            <Text style={styles.newsletterSub}>Daftarkan email Anda untuk menerima voucher diskon spesial dari Official Store.</Text>

            <View style={styles.newsletterFormRow}>
              <TextInput
                style={styles.newsletterInput}
                placeholder="Masukkan alamat email Anda..."
                placeholderTextColor="#94A3B8"
                value={emailSubscribe}
                onChangeText={setEmailSubscribe}
              />
              <TouchableOpacity style={styles.newsletterSubmitBtn} onPress={handleSubscribe} activeOpacity={0.85}>
                <Text style={styles.newsletterSubmitText}>Berlangganan</Text>
              </TouchableOpacity>
            </View>

            {subscribedSuccess && (
              <Text style={{ color: '#86EFAC', fontWeight: '800', marginTop: 10 }}>
                ✓ Terima kasih! Email Anda telah berhasil terdaftar.
              </Text>
            )}
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footerBg}>
          <View style={styles.footerContainer}>
            <View style={[styles.footerGrid, isDesktop ? styles.footerGridDesktop : styles.footerGridMobile]}>
              
              {/* Col 1: Brand Info */}
              <View style={{ flex: 1.5, minWidth: 240 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#D4B886', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="nutrition" size={20} color="#1C2417" />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#FFFFFF' }}>IDUKKI STYLE STORE</Text>
                </View>
                <Text style={styles.footerText}>
                  Produsen & Distributor Resmi Rempah, Cabai Bubuk Aida, & Saus Bawang khas Tasikmalaya. Mengutamakan kualitas & kemurnian cita rasa Indonesia.
                </Text>
                <Text style={[styles.footerText, { marginTop: 10 }]}>
                  📍 Alamat Utama: Jl. Pasir Bokor, Kp. Gunung Jambe, RT/RW 03/09, Cipawitra, Mangkubumi, Tasikmalaya, Jawa Barat.
                </Text>
              </View>

              {/* Col 2: Navigation Links */}
              <View style={{ flex: 1, minWidth: 160 }}>
                <Text style={styles.footerColTitle}>Pintasan Halaman</Text>
                <TouchableOpacity onPress={onOpenStore}><Text style={styles.footerLink}>Toko Online Product</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveMenu('story')}><Text style={styles.footerLink}>Kisah & Warisan</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveMenu('recipes')}><Text style={styles.footerLink}>Inspirasi Resep</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleContactWA}><Text style={styles.footerLink}>Layanan Pelanggan</Text></TouchableOpacity>
              </View>

              {/* Col 3: Contact & Support */}
              <View style={{ flex: 1, minWidth: 200 }}>
                <Text style={styles.footerColTitle}>Kontak & Operasional</Text>
                <Text style={styles.footerText}>📞 WhatsApp: +62 895-2388-8200</Text>
                <Text style={styles.footerText}>✉️ Email: info@store.aspartech.com</Text>
                <Text style={styles.footerText}>⏰ Jam Kerja: 07:00 - 22:00 WIB</Text>
              </View>

            </View>

            <View style={styles.footerBottomRow}>
              <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                © 2026 Official Store Tasikmalaya. All Rights Reserved. Designed in Idukki Spice Luxury Theme.
              </Text>
              <TouchableOpacity onPress={onOpenStore} activeOpacity={0.8}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#D4B886' }}>← Kembali ke Aplikasi Belanja</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF6EF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF6EF',
  },

  /* Top Announcement Bar */
  announcementBar: {
    backgroundColor: '#2E3A23',
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementText: {
    color: '#D4B886',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
  },

  /* Nav Header */
  navHeader: {
    backgroundColor: '#FAF6EF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE1D0',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  navContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadgeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6DCC9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8A876',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E3A23',
    letterSpacing: 1.2,
  },
  logoSubtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#7C6747',
    letterSpacing: 1,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navLinkItem: {
    paddingVertical: 4,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5D3B',
  },
  navLinkActive: {
    color: '#2E3A23',
    fontWeight: '900',
    borderBottomWidth: 2,
    borderBottomColor: '#2E3A23',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4A5D3B',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#2E3A23',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  appStoreBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  /* HERO SECTION */
  heroSection: {
    backgroundColor: '#FAF6EF',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  heroContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  heroDesktopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
  },
  heroMobileCol: {
    flexDirection: 'column',
    gap: 30,
  },
  heroLeftDesktop: {
    flex: 1.1,
  },
  heroLeftMobile: {
    width: '100%',
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#EAE1D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 16,
  },
  taglineText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E3A23',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#1C2417',
    lineHeight: 52,
    marginBottom: 16,
  },
  heroTitleHighlight: {
    color: '#4A5D3B',
    fontStyle: 'italic',
  },
  heroSubtitle: {
    fontSize: 15.5,
    color: '#5B6651',
    lineHeight: 24,
    marginBottom: 26,
    maxWidth: 540,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#2E3A23',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#1C2417',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.8,
  },
  heroBadgesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 36,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E6DCC9',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAE1D0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8A876',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2E3A23',
    lineHeight: 13,
  },

  heroRightDesktop: {
    flex: 1,
  },
  heroRightMobile: {
    width: '100%',
  },
  heroImageWrapper: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  heroMainImage: {
    width: '100%',
    height: 380,
    borderRadius: 20,
  },
  stampSealBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FAF6EF',
    borderWidth: 2,
    borderColor: '#2E3A23',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  stampText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2E3A23',
    marginTop: 2,
  },
  stampSubText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#4A5D3B',
  },
  floatingHighlightCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    maxWidth: 280,
  },

  /* VALUE PROPS BAR */
  valuePropsBar: {
    backgroundColor: '#2E3A23',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  valuePropsContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  valuePropsDesktopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valuePropsMobileCol: {
    flexDirection: 'column',
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valueTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  valueSub: {
    color: '#D4B886',
    fontSize: 11,
    marginTop: 2,
  },
  valueDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(212, 184, 134, 0.3)',
  },

  /* SECTION GENERAL */
  sectionContainer: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTagline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTaglineText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A5D3B',
    letterSpacing: 1,
  },
  sectionHeading: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1C2417',
    marginBottom: 16,
    lineHeight: 40,
  },
  storyRow: {
    gap: 40,
  },
  storyDesktopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyMobileCol: {
    flexDirection: 'column',
  },
  storyImageSide: {
    flex: 1,
  },
  storyImageMobile: {
    width: '100%',
  },
  storyImage: {
    width: '100%',
    height: 340,
    borderRadius: 20,
  },
  storyTextSide: {
    flex: 1.2,
  },
  storyTextMobile: {
    width: '100%',
  },
  storyParagraph: {
    fontSize: 15,
    color: '#5B6651',
    lineHeight: 24,
    marginBottom: 14,
  },
  outlineCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#2E3A23',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  outlineCtaText: {
    color: '#2E3A23',
    fontWeight: '800',
    fontSize: 12.5,
    letterSpacing: 0.5,
  },

  /* FEATURED PRODUCTS SECTION */
  productsSection: {
    backgroundColor: '#F3EFE6',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  productsHeaderCenter: {
    alignItems: 'center',
    marginBottom: 40,
    textAlign: 'center',
  },
  sectionHeadingCenter: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1C2417',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionSubCenter: {
    fontSize: 14.5,
    color: '#5B6651',
    textAlign: 'center',
    maxWidth: 600,
  },
  productsGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    gap: 20,
  },
  productsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  productsGridMobile: {
    flexDirection: 'column',
  },
  productCard: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAE1D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  productImageWrap: {
    position: 'relative',
    height: 180,
    backgroundColor: '#FAF6EF',
  },
  productCardImg: {
    width: '100%',
    height: '100%',
  },
  productBadgeTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#2E3A23',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  productCardBody: {
    padding: 14,
  },
  productCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1C2417',
    marginBottom: 4,
  },
  productCardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  priceAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#D91E28',
  },
  buyNowMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4A5D3B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buyNowMiniText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },

  /* RECIPES SECTION */
  recipesSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  recipesGrid: {
    gap: 20,
  },
  recipesGridDesktop: {
    flexDirection: 'row',
  },
  recipesGridMobile: {
    flexDirection: 'column',
  },
  recipeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAE1D0',
  },
  recipeImg: {
    width: '100%',
    height: 180,
  },
  recipeContent: {
    padding: 16,
  },
  recipeCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAE1D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  recipeCategoryText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2E3A23',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C2417',
    marginBottom: 6,
  },
  recipeDesc: {
    fontSize: 13,
    color: '#5B6651',
    lineHeight: 18,
  },

  /* NEWSLETTER */
  newsletterBanner: {
    backgroundColor: '#2E3A23',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  newsletterContainer: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  newsletterTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'center',
  },
  newsletterSub: {
    color: '#D4B886',
    fontSize: 13.5,
    textAlign: 'center',
    marginBottom: 20,
  },
  newsletterFormRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  newsletterInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 13.5,
    color: '#1C2417',
  },
  newsletterSubmitBtn: {
    backgroundColor: '#D4B886',
    borderRadius: 22,
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsletterSubmitText: {
    color: '#1C2417',
    fontWeight: '900',
    fontSize: 13.5,
  },

  /* FOOTER */
  footerBg: {
    backgroundColor: '#1C2417',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  footerContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  footerGrid: {
    gap: 30,
    marginBottom: 40,
  },
  footerGridDesktop: {
    flexDirection: 'row',
  },
  footerGridMobile: {
    flexDirection: 'column',
  },
  footerColTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D4B886',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 20,
  },
  footerLink: {
    fontSize: 13,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  footerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexWrap: 'wrap',
    gap: 12,
  },
});
