import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../utils/formatters';

const BRAND_RED = 'rgb(217, 30, 40)';

export default function LandingWebsiteScreen({ onOpenStore, onOpenProductDetail, onOpenAuth }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [activeMenu, setActiveMenu] = useState('home');

  const marketingRegions = [
    'Tasikmalaya',
    'Garut',
    'Bandung',
    'Purwokerto',
    'Cirebon',
    'Surabaya',
    'Semarang',
    'Cianjur',
    'Bogor',
    'Purwakarta',
    'Tangerang',
    'Banten',
    'Yogyakarta',
    'Bekasi',
  ];

  const officialProducts = [
    {
      id: 'aida-500g',
      name: 'Cabe Bubuk AIDA 500 GR',
      brand: 'AIDA',
      category: 'Cabe Bubuk',
      desc: 'Cabe bubuk murni kualitas utama, terkenal di Priangan Timur & Nusantara.',
      price: 23500,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    },
    {
      id: 'aida-renteng',
      name: 'AIDA RENTENG 25 GR',
      brand: 'AIDA',
      category: 'Cabe Bubuk Sachet',
      desc: 'Kemasan praktis sachet ekonomis 25 gram isi 10 pcs.',
      price: 14500,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    },
    {
      id: 'swan-saus-bawang',
      name: 'Cap Swan Terbang - Saus Sambal Bawang',
      brand: 'Cap Swan Terbang',
      category: 'Saus Sambal',
      desc: 'Saus sambal bawang beraroma harum dan gurih pedas khas.',
      price: 34000,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    },
    {
      id: 'swan-ekstra-pedas',
      name: 'Cap Swan Terbang - Saus Ekstra Pedas',
      brand: 'Cap Swan Terbang',
      category: 'Saus Pedas',
      desc: 'Saus ekstra pedas dengan tekstur mantap untuk aneka kuliner.',
      price: 18500,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    },
    {
      id: 'swan-stick-premium',
      name: 'Cap Swan Terbang - Saus Stick Premium',
      brand: 'Cap Swan Terbang',
      category: 'Saus Premium',
      desc: 'Saus stick kemasan premium higienis siap guna.',
      price: 22000,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    },
    {
      id: 'sambal-cabe-aida',
      name: 'Sambal Cabe AIDA Premium',
      brand: 'AIDA',
      category: 'Sambal Olahan',
      desc: 'Sambal cabe asli racikan khas CV Makmur Permata.',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    },
  ];

  const handleContactWA = () => {
    const phone = '6282119080044';
    const text = 'Halo CV Makmur Permata! Saya berminat untuk informasi pemesanan & kerjasama produk Cabe Bubuk AIDA / Cap Swan Terbang.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  const handleOpenInstagram = () => {
    const url = 'https://instagram.com/cabebubuk_aida';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  const handleOpenLinktree = () => {
    const url = 'https://linktr.ee/cabebubukaida';
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
          🌶️ CV. MAKMUR PERMATA • PRODUSEN RESMI CABE BUBUK AIDA & CAP SWAN TERBANG • TASIKMALAYA 🌶️
        </Text>
      </View>

      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <View style={styles.navContainer}>
          {/* Brand Logo */}
          <TouchableOpacity style={styles.logoGroup} onPress={onOpenStore} activeOpacity={0.85}>
            <View style={styles.logoBadgeIcon}>
              <Ionicons name="flame" size={24} color={BRAND_RED} />
            </View>
            <View>
              <Text style={styles.logoTitle}>CV. MAKMUR PERMATA</Text>
              <Text style={styles.logoSubtitle}>PRODUSEN CABE BUBUK AIDA & SAUS</Text>
            </View>
          </TouchableOpacity>

          {/* Nav Links for Desktop */}
          {isDesktop && (
            <View style={styles.navLinksRow}>
              <TouchableOpacity onPress={() => setActiveMenu('home')} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, activeMenu === 'home' && styles.navLinkActive]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveMenu('tentang')} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, activeMenu === 'tentang' && styles.navLinkActive]}>Tentang Kami</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveMenu('produk')} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, activeMenu === 'produk' && styles.navLinkActive]}>Produk Kami</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveMenu('kebijakan')} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, activeMenu === 'kebijakan' && styles.navLinkActive]}>Kebijakan Mutu & Halal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveMenu('wilayah')} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, activeMenu === 'wilayah' && styles.navLinkActive]}>Wilayah Pemasaran</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleContactWA} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Kontak</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right Header Actions */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity onPress={onOpenStore} style={styles.appStoreBtn} activeOpacity={0.85}>
              <Ionicons name="bag-handle" size={16} color="#FFFFFF" />
              <Text style={styles.appStoreBtnText}>Toko Belanja Online</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION WITH EXACT rgb(217, 30, 40) BACKGROUND */}
        <View style={styles.heroSection}>
          <View style={[styles.heroContainer, isDesktop ? styles.heroDesktopRow : styles.heroMobileCol]}>
            
            {/* Left Hero Content */}
            <View style={isDesktop ? styles.heroLeftDesktop : styles.heroLeftMobile}>
              <View style={styles.taglineBadge}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#FDE68A" />
                <Text style={styles.taglineText}>MUTU • HALAL • TERSTANDARISASI</Text>
              </View>

              <Text style={styles.heroTitle}>
                Cabe Bubuk AIDA{'\n'}
                <Text style={styles.heroTitleHighlight}>& Cap Swan Terbang</Text>
              </Text>

              <Text style={styles.heroSubtitle}>
                CV. Makmur Permata merupakan perusahaan industri pengolahan makanan terkemuka yang memproduksi Cabe Bubuk AIDA, Saus Sambal Bawang, dan Saus Ekstra Pedas dengan proses higienis & bahan baku halal berkualitas.
              </Text>

              {/* Action CTA Buttons */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <TouchableOpacity style={styles.heroCtaBtn} onPress={onOpenStore} activeOpacity={0.88}>
                  <Text style={styles.heroCtaText}>BELI PRODUK ONLINE</Text>
                  <Ionicons name="arrow-forward-outline" size={18} color={BRAND_RED} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.heroCtaBtnOutline} onPress={handleOpenLinktree} activeOpacity={0.85}>
                  <Ionicons name="git-network-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.heroCtaTextOutline}>INFO KERJASAMA & PEMESANAN</Text>
                </TouchableOpacity>
              </View>

              {/* 4 Trust Feature Badges */}
              <View style={styles.heroBadgesGrid}>
                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconCircle}>
                    <Ionicons name="checkmark-done-circle" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.badgeText}>100% HALAL &{'\n'}HIGIENIS</Text>
                </View>

                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconCircle}>
                    <Ionicons name="location-outline" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.badgeText}>KAWALU, KOTA{'\n'}TASIKMALAYA</Text>
                </View>

                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconCircle}>
                    <Ionicons name="ribbon-outline" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.badgeText}>KEAMANAN{'\n'}PANGAN BPOM</Text>
                </View>

                <View style={styles.badgeItem}>
                  <View style={styles.badgeIconCircle}>
                    <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.badgeText}>DISTRIBUSI{'\n'}NASIONAL</Text>
                </View>
              </View>
            </View>

            {/* Right Hero Visual Package */}
            <View style={isDesktop ? styles.heroRightDesktop : styles.heroRightMobile}>
              <View style={styles.heroImageWrapper}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=900&q=80' }}
                  style={styles.heroMainImage}
                  resizeMode="cover"
                />
                
                {/* Stamp Seal Badge */}
                <View style={styles.stampSealBadge}>
                  <Ionicons name="flame" size={22} color={BRAND_RED} />
                  <Text style={styles.stampText}>AIDA & SWAN</Text>
                  <Text style={styles.stampSubText}>CV MAKMUR PERMATA</Text>
                </View>

                {/* Floating Info Card */}
                <View style={styles.floatingHighlightCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="nutrition" size={24} color={BRAND_RED} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#1C2417' }}>CV. MAKMUR PERMATA</Text>
                      <Text style={{ fontSize: 11, color: '#64748B' }}>Tasikmalaya, Jawa Barat</Text>
                      <Text style={{ fontSize: 11.5, fontWeight: '800', color: BRAND_RED, marginTop: 2 }}>Produsen Seasoning Terpercaya</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

          </View>
        </View>

        {/* BOTTOM VALUE PROPOSITIONS BAR */}
        <View style={styles.valuePropsBar}>
          <View style={[styles.valuePropsContainer, isDesktop ? styles.valuePropsDesktopRow : styles.valuePropsMobileCol]}>
            <View style={styles.valueItem}>
              <Ionicons name="shield-checkmark" size={22} color="#FDE68A" />
              <View>
                <Text style={styles.valueTitle}>SISTEM MANAJEMEN HALAL</Text>
                <Text style={styles.valueSub}>Memenuhi standar keamanan pangan nasional</Text>
              </View>
            </View>

            <View style={styles.valueDivider} />

            <View style={styles.valueItem}>
              <Ionicons name="leaf" size={22} color="#FDE68A" />
              <View>
                <Text style={styles.valueTitle}>BAHAN BAKU BERKUALITAS</Text>
                <Text style={styles.valueSub}>Diproses dari cabai segar pilihan</Text>
              </View>
            </View>

            <View style={styles.valueDivider} />

            <View style={styles.valueItem}>
              <Ionicons name="storefront" size={22} color="#FDE68A" />
              <View>
                <Text style={styles.valueTitle}>PABRIK KAWALU TASIKMALAYA</Text>
                <Text style={styles.valueSub}>Pusat produksi Cabe Bubuk AIDA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION: TENTANG KAMI */}
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
                <Ionicons name="business-outline" size={14} color={BRAND_RED} />
                <Text style={styles.sectionTaglineText}>TENTANG KAMI</Text>
              </View>
              <Text style={styles.sectionHeading}>
                CV. MAKMUR PERMATA
              </Text>

              <Text style={styles.storyParagraph}>
                CV Makmur Permata merupakan Perusahaan berkembang yang bergerak dalam industri pengolahan makanan yang memproduksi Saus, Sambal, dan Cabe Bubuk dengan proses yang higienis dan terstandarisasi serta menggunakan bahan baku yang halal & berkualitas.
              </Text>
              <Text style={styles.storyParagraph}>
                Produk CV Makmur Permata memiliki banyak varian unggulan, salah satunya Cabe Bubuk AIDA. Produk Cabe Bubuk AIDA sudah sangat terkenal di wilayah Priangan Timur, khususnya di daerah Tasikmalaya. Pusat dari pembuatan Cabe Bubuk AIDA ini bertempat di Kota Tasikmalaya, Kec. Kawalu.
              </Text>
              <Text style={styles.storyParagraph}>
                Selain AIDA, terdapat juga brand Cap Swan Terbang yang memproduksi Saus Sambal Bawang, Saus Ekstra Pedas, Saus Stick Premium, Saus Ekstra Pedas Premium, dan Sambal Cabe AIDA.
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION: KEBIJAKAN MUTU, HALAL, & KEAMANAN PANGAN */}
        <View style={styles.kebijakanSection}>
          <View style={styles.sectionHeaderCenter}>
            <View style={styles.sectionTagline}>
              <Ionicons name="ribbon-outline" size={14} color={BRAND_RED} />
              <Text style={styles.sectionTaglineText}>STANDARISASI & KUALITAS</Text>
            </View>
            <Text style={styles.sectionHeadingCenter}>Kebijakan Mutu, Halal, dan Keamanan Pangan</Text>
            <Text style={styles.sectionSubCenter}>
              CV. MAKMUR PERMATA berkomitmen untuk menghasilkan produk yang berkualitas, halal, dan aman untuk dikonsumsi, memenuhi persyaratan peraturan perundang-undangan serta persyaratan pelanggan yang telah disetujui bersama serta mempertimbangkan konteks dan arah strategi perusahaan.
            </Text>
          </View>

          <View style={{ maxWidth: 1000, width: '100%', alignSelf: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1C2417', textAlign: 'center', lineHeight: 22 }}>
              Untuk selalu mencapai kebijakan tersebut maka CV. MAKMUR PERMATA:
            </Text>
          </View>

          <View style={[styles.kebijakanGrid, isDesktop ? styles.kebijakanGridDesktop : styles.kebijakanGridMobile]}>
            <View style={styles.kebijakanCard}>
              <View style={styles.kebijakanNumberBadge}>
                <Text style={styles.kebijakanNumberText}>1</Text>
              </View>
              <Text style={styles.kebijakanCardTitle}>Penerapan Konsisten</Text>
              <Text style={styles.kebijakanCardDesc}>
                Semua stakeholder berkomitmen menerapkan semua persyaratan Sistem Mutu, Halal, dan Keamanan Pangan secara baik dan konsisten.
              </Text>
            </View>

            <View style={styles.kebijakanCard}>
              <View style={styles.kebijakanNumberBadge}>
                <Text style={styles.kebijakanNumberText}>2</Text>
              </View>
              <Text style={styles.kebijakanCardTitle}>Memenuhi Regulasi & Pelanggan</Text>
              <Text style={styles.kebijakanCardDesc}>
                Menghasilkan produk yang memenuhi persyaratan peraturan perundang-undangan dan persyaratan pelanggan.
              </Text>
            </View>

            <View style={styles.kebijakanCard}>
              <View style={styles.kebijakanNumberBadge}>
                <Text style={styles.kebijakanNumberText}>3</Text>
              </View>
              <Text style={styles.kebijakanCardTitle}>Pengembangan SDM & Sarana</Text>
              <Text style={styles.kebijakanCardDesc}>
                Selalu berkomitmen untuk meningkatkan dan mengembangkan sumber daya manusia, perusahaan baik sarana dan prasarana yang menunjang keberhasilan Sistem Manajemen Mutu, Halal, dan Keamanan Pangan.
              </Text>
            </View>
          </View>

          <View style={styles.directorBadgeBox}>
            <Ionicons name="document-text-outline" size={24} color={BRAND_RED} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#1C2417' }}>
                Ditetapkan di Tasikmalaya, 29 Maret 2021
              </Text>
              <Text style={{ fontSize: 12.5, color: BRAND_RED, marginTop: 2, fontWeight: '800' }}>
                Direktur CV. MAKMUR PERMATA
              </Text>
            </View>
          </View>

          <View style={{ maxWidth: 840, width: '100%', alignSelf: 'center', marginTop: 20, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 14, borderWidth: 1, borderColor: '#FFE4E6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
            <Text style={{ fontSize: 13.5, color: '#334155', lineHeight: 22, textAlign: 'center', fontWeight: '600' }}>
              Untuk mendukung keberhasilan dari kebijakan keamanan pangan, CV. MAKMUR PERMATA membuat sasaran keamanan pangan masing-masing fungsi dan Departemen.
            </Text>
          </View>
        </View>

        {/* SECTION: VISI & MISI PERUSAHAAN */}
        <View style={styles.visiMisiSection}>
          <View style={[styles.visiMisiRow, isDesktop ? styles.visiMisiDesktopRow : styles.visiMisiMobileCol]}>
            
            {/* VISI */}
            <View style={styles.visiCard}>
              <View style={styles.visiIconCircle}>
                <Ionicons name="eye" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.visiTitle}>VISI PERUSAHAAN</Text>
              <Text style={styles.visiDesc}>
                "CV. Makmur Permata berusaha menjadi salah satu produsen seasoning terkemuka di Indonesia dan Internasional."
              </Text>
            </View>

            {/* MISI */}
            <View style={styles.misiCard}>
              <View style={styles.misiIconCircle}>
                <Ionicons name="rocket" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.misiTitle}>MISI PERUSAHAAN</Text>
              <View style={{ gap: 10, marginTop: 10 }}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                  <Ionicons name="checkmark-circle" size={18} color={BRAND_RED} style={{ marginTop: 2 }} />
                  <Text style={styles.misiPointText}>
                    Mengutamakan kepuasan pelanggan dalam memproduksi produk yang berkualitas dan aman.
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                  <Ionicons name="checkmark-circle" size={18} color={BRAND_RED} style={{ marginTop: 2 }} />
                  <Text style={styles.misiPointText}>
                    Terus menerus melakukan perbaikan dan peningkatan kualitas sistem manajemen keamanan pangan.
                  </Text>
                </View>
              </View>
            </View>

          </View>
        </View>

        {/* SECTION: PRODUK KAMI */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeaderCenter}>
            <View style={styles.sectionTagline}>
              <Ionicons name="cube-outline" size={14} color={BRAND_RED} />
              <Text style={styles.sectionTaglineText}>PRODUK UNGGULAN</Text>
            </View>
            <Text style={styles.sectionHeadingCenter}>Produk Resmi CV. Makmur Permata</Text>
            <Text style={styles.sectionSubCenter}>
              Varian Cabe Bubuk AIDA dan Saus Sambal Cap Swan Terbang kualitas terbaik.
            </Text>
          </View>

          <View style={[styles.productsGrid, isDesktop ? styles.productsGridDesktop : styles.productsGridMobile]}>
            {officialProducts.map((prod) => (
              <View key={prod.id} style={styles.productCard}>
                <View style={styles.productImageWrap}>
                  <Image source={{ uri: prod.image }} style={styles.productCardImg} resizeMode="cover" />
                  <View style={styles.productBadgeTop}>
                    <Text style={styles.productBadgeText}>{prod.brand}</Text>
                  </View>
                </View>

                <View style={styles.productCardBody}>
                  <Text style={styles.productCardTitle} numberOfLines={1}>{prod.name}</Text>
                  <Text style={styles.productCardDesc} numberOfLines={2}>{prod.desc}</Text>

                  <View style={styles.productPriceRow}>
                    <View>
                      <Text style={styles.priceLabel}>Harga Resmi</Text>
                      <Text style={styles.priceAmount}>{formatRupiah(prod.price)}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.buyNowMiniBtn}
                      onPress={onOpenStore}
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
        </View>

        {/* SECTION: WILAYAH PEMASARAN */}
        <View style={styles.regionsSection}>
          <View style={styles.sectionHeaderCenter}>
            <View style={styles.sectionTagline}>
              <Ionicons name="map-outline" size={14} color={BRAND_RED} />
              <Text style={styles.sectionTaglineText}>DISTRIBUSI NASIONAL</Text>
            </View>
            <Text style={styles.sectionHeadingCenter}>Wilayah Pemasaran Kami</Text>
            <Text style={styles.sectionSubCenter}>
              Jaringan distribusi resmi CV. Makmur Permata tersebar di berbagai kota besar di Pulau Jawa dan seluruh Indonesia.
            </Text>
          </View>

          <View style={styles.regionsGrid}>
            {marketingRegions.map((region, idx) => (
              <View key={idx} style={styles.regionBadge}>
                <Ionicons name="location" size={14} color={BRAND_RED} />
                <Text style={styles.regionText}>{region}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* LINKTREE & HUBUNGI KAMI BANNER (EXACT rgb(217, 30, 40)) */}
        <View style={styles.linktreeBanner}>
          <View style={styles.linktreeContainer}>
            <Ionicons name="link-outline" size={36} color="#FDE68A" />
            <Text style={styles.linktreeTitle}>Info Kerjasama & Pemesanan Seluruh Cabang</Text>
            <Text style={styles.linktreeSub}>Hubungi tim pemasaran resmi kami untuk agen, distributor, dan pembelian grosir.</Text>

            <TouchableOpacity style={styles.linktreeBtn} onPress={handleOpenLinktree} activeOpacity={0.85}>
              <Ionicons name="open-outline" size={18} color={BRAND_RED} />
              <Text style={styles.linktreeBtnText}>KLIK LINK PEMESANAN & KERJASAMA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FOOTER & LOKASI KAMI (DARK CHARCOAL #120304 - ZERO BOTTOM WHITESPACE) */}
        <View style={styles.footerBg}>
          <View style={styles.footerContainer}>
            <View style={[styles.footerGrid, isDesktop ? styles.footerGridDesktop : styles.footerGridMobile]}>
              
              {/* Col 1: Lokasi & Profil */}
              <View style={{ flex: 1.5, minWidth: 260 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginBottom: 12 }}>
                  CV. MAKMUR PERMATA
                </Text>
                <Text style={styles.footerText}>
                  Produsen Resmi Cabe Bubuk AIDA & Cap Swan Terbang. Memproduksi saus, sambal, dan seasoning higienis & halal.
                </Text>

                <View style={{ marginTop: 14, gap: 6 }}>
                  <Text style={styles.footerColTitle}>📍 Lokasi Pabrik & Kantor Pusat:</Text>
                  <Text style={styles.footerText}>
                    Jl. Perintis Kemerdekaan No.160, Karsamenak, Kec. Kawalu, Tasikmalaya, Jawa Barat 46182
                  </Text>
                </View>
              </View>

              {/* Col 2: Kontak Resmi */}
              <View style={{ flex: 1, minWidth: 200 }}>
                <Text style={styles.footerColTitle}>📞 Kontak Kami</Text>
                <Text style={styles.footerText}>Telp 1: +62 265 3367 94</Text>
                <Text style={styles.footerText}>WA 1: 082119080044</Text>
                <Text style={styles.footerText}>WA 2: 082218802048</Text>
                <Text style={styles.footerText}>Email: cvmakmurpermata@pedasalami.com</Text>
              </View>

              {/* Col 3: Sosial Media */}
              <View style={{ flex: 1, minWidth: 180 }}>
                <Text style={styles.footerColTitle}>📱 Media Sosial & Link</Text>
                <TouchableOpacity onPress={handleOpenInstagram} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Ionicons name="logo-instagram" size={18} color="#FDE68A" />
                  <Text style={{ color: '#FFFFFF', fontSize: 13 }}>@cabebubuk_aida</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleOpenLinktree} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="git-network-outline" size={18} color="#FDE68A" />
                  <Text style={{ color: '#FDE68A', fontSize: 13, fontWeight: '800' }}>Linktree Kerjasama</Text>
                </TouchableOpacity>
              </View>

            </View>

            <View style={styles.footerBottomRow}>
              <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                © 2026 CV. Makmur Permata. Hak Cipta Dilindungi Undang-Undang.
              </Text>
              <TouchableOpacity onPress={onOpenStore} activeOpacity={0.8}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#FDE68A' }}>← Ke Aplikasi Toko Online</Text>
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
    backgroundColor: '#120304',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF1F2',
  },
  scrollContent: {
    paddingBottom: 0,
  },

  /* Top Announcement Bar (EXACT rgb(217, 30, 40)) */
  announcementBar: {
    backgroundColor: 'rgb(217, 30, 40)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
  },

  /* Nav Header */
  navHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E6',
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
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: 'rgb(217, 30, 40)',
    letterSpacing: 0.8,
  },
  logoSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgb(217, 30, 40)',
    letterSpacing: 0.5,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navLinkItem: {
    paddingVertical: 4,
  },
  navLinkText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  navLinkActive: {
    color: 'rgb(217, 30, 40)',
    fontWeight: '900',
    borderBottomWidth: 2,
    borderBottomColor: 'rgb(217, 30, 40)',
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
    backgroundColor: 'rgb(217, 30, 40)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: 'rgb(217, 30, 40)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  appStoreBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  /* HERO SECTION (EXACT rgb(217, 30, 40) BACKGROUND) */
  heroSection: {
    backgroundColor: 'rgb(217, 30, 40)',
    paddingVertical: 44,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 16,
  },
  taglineText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 52,
    marginBottom: 16,
  },
  heroTitleHighlight: {
    color: '#FDE68A',
    fontStyle: 'italic',
  },
  heroSubtitle: {
    fontSize: 15.5,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 24,
    marginBottom: 26,
    maxWidth: 540,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCtaText: {
    color: 'rgb(217, 30, 40)',
    fontWeight: '900',
    fontSize: 13.5,
    letterSpacing: 0.6,
  },
  heroCtaBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroCtaTextOutline: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12.5,
  },

  heroBadgesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 36,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
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
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgb(217, 30, 40)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  stampText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: 'rgb(217, 30, 40)',
    marginTop: 2,
  },
  stampSubText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#1C2417',
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
    maxWidth: 290,
  },

  /* VALUE PROPS BAR (DARK RED ACCENT) */
  valuePropsBar: {
    backgroundColor: 'rgb(160, 20, 30)',
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
    color: '#FDE68A',
    fontSize: 11,
    marginTop: 2,
  },
  valueDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(253, 230, 138, 0.3)',
  },

  /* SECTION GENERAL */
  sectionContainer: {
    paddingVertical: 50,
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
    color: 'rgb(217, 30, 40)',
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
    fontSize: 14.5,
    color: '#475569',
    lineHeight: 23,
    marginBottom: 14,
  },

  /* KEBIJAKAN MUTU SECTION */
  kebijakanSection: {
    backgroundColor: '#FFF1F2',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  sectionHeaderCenter: {
    alignItems: 'center',
    marginBottom: 36,
    textAlign: 'center',
  },
  sectionHeadingCenter: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1C2417',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionSubCenter: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    maxWidth: 680,
    lineHeight: 22,
  },
  kebijakanGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    gap: 20,
  },
  kebijakanGridDesktop: {
    flexDirection: 'row',
  },
  kebijakanGridMobile: {
    flexDirection: 'column',
  },
  kebijakanCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  kebijakanNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgb(217, 30, 40)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  kebijakanNumberText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  kebijakanCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C2417',
    marginBottom: 8,
  },
  kebijakanCardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  directorBadgeBox: {
    maxWidth: 500,
    alignSelf: 'center',
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgb(217, 30, 40)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  /* VISI MISI SECTION */
  visiMisiSection: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  visiMisiRow: {
    gap: 24,
  },
  visiMisiDesktopRow: {
    flexDirection: 'row',
  },
  visiMisiMobileCol: {
    flexDirection: 'column',
  },
  visiCard: {
    flex: 1,
    backgroundColor: 'rgb(217, 30, 40)',
    borderRadius: 20,
    padding: 28,
  },
  visiIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  visiTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FDE68A',
    marginBottom: 10,
    letterSpacing: 1,
  },
  visiDesc: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  misiCard: {
    flex: 1.2,
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    padding: 28,
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  misiIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgb(217, 30, 40)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  misiTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: 'rgb(217, 30, 40)',
    marginBottom: 10,
    letterSpacing: 1,
  },
  misiPointText: {
    fontSize: 14,
    color: '#1C2417',
    lineHeight: 22,
    flex: 1,
  },

  /* PRODUK KAMI SECTION */
  productsSection: {
    backgroundColor: '#FFF1F2',
    paddingVertical: 50,
    paddingHorizontal: 20,
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
    borderColor: '#FECACA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  productImageWrap: {
    position: 'relative',
    height: 180,
    backgroundColor: '#FFF1F2',
  },
  productCardImg: {
    width: '100%',
    height: '100%',
  },
  productBadgeTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgb(217, 30, 40)',
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
    fontSize: 14,
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
    color: 'rgb(217, 30, 40)',
  },
  buyNowMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgb(217, 30, 40)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buyNowMiniText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },

  /* WILAYAH PEMASARAN SECTION */
  regionsSection: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  regionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  regionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  regionText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgb(217, 30, 40)',
  },

  /* LINKTREE BANNER (EXACT rgb(217, 30, 40)) */
  linktreeBanner: {
    backgroundColor: 'rgb(217, 30, 40)',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  linktreeContainer: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  linktreeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'center',
  },
  linktreeSub: {
    color: '#FDE68A',
    fontSize: 13.5,
    textAlign: 'center',
    marginBottom: 20,
  },
  linktreeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 24,
  },
  linktreeBtnText: {
    color: 'rgb(217, 30, 40)',
    fontWeight: '900',
    fontSize: 13.5,
    letterSpacing: 0.5,
  },

  /* FOOTER (ULTRA DARK CHARCOAL #120304 - ZERO BOTTOM WHITESPACE) */
  footerBg: {
    backgroundColor: '#120304',
    paddingTop: 50,
    paddingBottom: 30,
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
    color: '#FDE68A',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 4,
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
