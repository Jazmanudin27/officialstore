import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Base64 Embedded Font Data for Web (Bulletproof vector icon rendering)
import { IONICONS_BASE64 } from './src/constants/ioniconsBase64';

// Constants & Data
import { COLORS } from './src/constants/theme';
import { PRODUCTS } from './src/data/mockProducts';
import { apiService } from './src/services/api';

// Custom Hooks
import { useCart } from './src/hooks/useCart';
import { useFavorites } from './src/hooks/useFavorites';

// Components
import Header from './src/components/header/Header';
import CartModal from './src/components/cart/CartModal';
import BottomNavigation from './src/components/navigation/BottomNavigation';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import ChatScreen from './src/screens/ChatScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import VoucherScreen from './src/screens/VoucherScreen';
import PromoScreen from './src/screens/PromoScreen';
import AddressModal from './src/screens/AddressModal';
import SplashScreen from './src/components/splash/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState({
    id: 'addr1',
    title: 'Rumah',
    isUtama: true,
    recipient: 'Ade Fitri Nuraeni',
    phone: '0895238888200',
    addressLine1: 'Jl. Pasir Bokor, Kp. Gunung Jambe, RT/RW 03/09',
    addressLine2: 'Cipawitra, Kec. Mangkubumi, Kab. Tasikmalaya, Jawa Barat 46181, Indonesia',
    note: 'Patokan Rafasya Cell',
  });
  const [addressReturnTarget, setAddressReturnTarget] = useState(null);
  const [voucherReturnTarget, setVoucherReturnTarget] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  // Address and modal flow handlers (avoids modal-over-modal collision on iOS/Web/Android)
  const handleOpenAddressFromHome = () => {
    setAddressReturnTarget(null);
    setIsAddressOpen(true);
  };

  const handleOpenAddressFromCart = () => {
    setIsCartOpen(false);
    setAddressReturnTarget('cart');
    setIsAddressOpen(true);
  };

  const handleOpenAddressFromCheckout = () => {
    setIsCheckoutOpen(false);
    setAddressReturnTarget('checkout');
    setIsAddressOpen(true);
  };

  const handleCloseAddress = () => {
    setIsAddressOpen(false);
    if (addressReturnTarget === 'cart') {
      setIsCartOpen(true);
    } else if (addressReturnTarget === 'checkout') {
      setIsCheckoutOpen(true);
    }
    setAddressReturnTarget(null);
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    handleCloseAddress();
  };

  const handleOpenVoucher = () => {
    setIsCheckoutOpen(false);
    setVoucherReturnTarget('checkout');
    setIsVoucherOpen(true);
  };

  const handleCloseVoucher = () => {
    setIsVoucherOpen(false);
    if (voucherReturnTarget === 'checkout') {
      setIsCheckoutOpen(true);
    }
    setVoucherReturnTarget(null);
  };

  const handleSelectVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    handleCloseVoucher();
  };

  // Inject Base64 Ionicons font on Web to guarantee 100% icon rendering offline/online
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'expo-vector-icons-ionicons-embedded';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.appendChild(
          document.createTextNode(`
            @font-face {
              font-family: 'Ionicons';
              src: url('${IONICONS_BASE64}') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
          `)
        );
        document.head.appendChild(style);
      }
    }
  }, []);

  // Custom Hooks Management
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    totalCartCount,
  } = useCart();

  const { favorites, toggleFavorite, isFavorite, favoriteCount } = useFavorites();
  const [productList, setProductList] = useState(PRODUCTS);

  // Ambil data produk real-time dari API Database (dengan auto fallback)
  useEffect(() => {
    apiService.getProducts().then((data) => {
      if (data && data.length > 0) {
        setProductList(data);
      }
    });
  }, []);

  // Filter products for Home screen
  const filteredProducts = productList.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await apiService.getProducts();
      if (data && data.length > 0) {
        setProductList(data);
      }
    } catch (e) {
      console.warn('Error refreshing data:', e);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 700);
    }
  };

  // Render view based on Active Bottom Tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'belanja':
      case 'explore':
        return (
          <ExploreScreen
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
            getItemQuantity={getItemQuantity}
            openSearch={() => setIsSearchOpen(true)}
            openCart={() => setIsCartOpen(true)}
            cartCount={totalCartCount}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        );
      case 'promo':
        return (
          <PromoScreen
            onAddToCart={addToCart}
            openSearch={() => setIsSearchOpen(true)}
            openCart={() => setIsCartOpen(true)}
            cartCount={totalCartCount}
          />
        );
      case 'wishlist':
        return (
          <WishlistScreen
            favorites={favorites}
            onAddToCart={addToCart}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'pesanan':
      case 'akun':
      case 'profile':
        return <ProfileScreen />;
      case 'home':
      default:
        return (
          <HomeScreen
            products={filteredProducts}
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
            getItemQuantity={getItemQuantity}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onSelectCategory={setSelectedCategory}
            onScrollStateChange={setIsScrolled}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.primaryRed} />

      {/* Animated E-Commerce Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Top Red Collapsible Header Bar (Only visible on Home tab) */}
      {activeTab === 'home' && (
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={totalCartCount}
          openCart={() => setIsCartOpen(true)}
          openChat={() => setIsChatOpen(true)}
          openNotification={() => setIsNotificationOpen(true)}
          openAddress={handleOpenAddressFromHome}
          selectedAddress={selectedAddress}
          isScrolled={isScrolled}
          openSearch={() => setIsSearchOpen(true)}
        />
      )}

      {/* Active Screen View */}
      <View style={styles.mainContent}>{renderTabContent()}</View>

      {/* Interactive Search Screen Modal */}
      <SearchScreen
        visible={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectKeyword={(keyword) => setSearchQuery(keyword)}
      />

      {/* Chat / Kotak Masuk Screen Modal */}
      <ChatScreen
        visible={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Notification / Pemberitahuan Screen Modal */}
      <NotificationScreen
        visible={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Cart Modal View */}
      <CartModal
        visible={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onCheckout={() => setIsCheckoutOpen(true)}
        selectedAddress={selectedAddress}
        onSelectAddress={setSelectedAddress}
        onStartShopping={() => {
          setIsCartOpen(false);
          setActiveTab('belanja');
        }}
      />

      {/* Ringkasan Pesanan / Checkout Screen Modal */}
      <CheckoutScreen
        visible={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        selectedVoucher={selectedVoucher}
        onSelectVoucher={setSelectedVoucher}
        selectedAddress={selectedAddress}
        onSelectAddress={setSelectedAddress}
        onCompleteCheckout={() => {
          clearCart();
          setSelectedVoucher(null);
          setIsCartOpen(false);
        }}
      />

      {/* Voucher Selection Screen Modal */}
      <VoucherScreen
        visible={isVoucherOpen}
        onClose={handleCloseVoucher}
        onSelectVoucher={handleSelectVoucher}
      />

      {/* Cara Belanja / Ganti Alamat Screen Overlay for Beranda */}
      <AddressModal
        visible={isAddressOpen}
        onClose={() => setIsAddressOpen(false)}
        onSelectAddress={(addr) => {
          setSelectedAddress(addr);
          setIsAddressOpen(false);
        }}
        selectedAddress={selectedAddress}
      />

      {/* Bottom 5-Tab Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryRed,
    paddingTop: StatusBar.currentHeight || 0,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
