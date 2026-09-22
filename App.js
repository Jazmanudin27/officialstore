import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Base64 Embedded Font Data for Web (Bulletproof vector icon rendering)
import { IONICONS_BASE64 } from './src/constants/ioniconsBase64';

// Constants & Data
import { COLORS } from './src/constants/theme';
import { PRODUCTS } from './src/data/mockProducts';

// Custom Hooks
import { useCart } from './src/hooks/useCart';
import { useFavorites } from './src/hooks/useFavorites';

// Components
import Header from './src/components/header/Header';
import StickyPromoBanner from './src/components/promo/StickyPromoBanner';
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
import SplashScreen from './src/components/splash/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

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
    totalCartCount,
  } = useCart();

  const { favorites, toggleFavorite, isFavorite, favoriteCount } = useFavorites();

  // Filter products for Home screen
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render view based on Active Bottom Tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'belanja':
      case 'explore':
        return <ExploreScreen onAddToCart={addToCart} />;
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
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onSelectCategory={setSelectedCategory}
            onScrollStateChange={setIsScrolled}
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
          isScrolled={isScrolled}
          openSearch={() => setIsSearchOpen(true)}
        />
      )}

      {/* Active Screen View */}
      <View style={styles.mainContent}>
        {renderTabContent()}
      </View>

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

      {/* Sticky Bottom Floating Banner (HARGA SUPER!) (Home tab only) */}
      {activeTab === 'home' && <StickyPromoBanner onOpen={() => setIsCartOpen(true)} />}

      {/* Cart Modal View */}
      <CartModal
        visible={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Ringkasan Pesanan / Checkout Screen Modal */}
      <CheckoutScreen
        visible={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOpenVoucher={() => setIsVoucherOpen(true)}
        selectedVoucher={selectedVoucher}
        onCompleteCheckout={() => {
          clearCart();
          setSelectedVoucher(null);
          setIsCartOpen(false);
        }}
      />

      {/* Voucher Selection Screen Modal */}
      <VoucherScreen
        visible={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
        onSelectVoucher={(voucher) => setSelectedVoucher(voucher)}
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
