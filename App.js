import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform, useWindowDimensions, Modal, TouchableOpacity } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

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
import OrdersScreen from './src/screens/OrdersScreen';
import AddressModal from './src/screens/AddressModal';
import AuthModal from './src/screens/AuthModal';
import ProductDetailModal from './src/screens/ProductDetailModal';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminAuthScreen from './src/screens/AdminAuthScreen';
import SplashScreen from './src/components/splash/SplashScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { storage } from './src/utils/storage';

import PageTransition from './src/components/navigation/PageTransition';

function AppContent() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [storeSettings, setStoreSettings] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Restore active sessions and fetch Store Settings on page load / mount
  useEffect(() => {
    try {
      const savedAdmin = storage.getItem('official_store_admin_session');
      if (savedAdmin) {
        setAdminUser(JSON.parse(savedAdmin));
      }
      const savedUser = storage.getItem('official_store_user_session');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn('Session restore warning:', e);
    }

    apiService.getStoreSettings()
      .then((settings) => {
        if (settings) setStoreSettings(settings);
      })
      .catch((e) => console.warn('Get settings error:', e));
  }, []);

  const handleSaveAdminSession = (data) => {
    setAdminUser(data);
    try {
      storage.setItem('official_store_admin_session', JSON.stringify(data));
    } catch (e) {
      console.warn('Save admin session error:', e);
    }
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    try {
      storage.removeItem('official_store_admin_session');
    } catch (e) {
      console.warn('Remove admin session error:', e);
    }
  };

  const handleSaveUserSession = (userData) => {
    setCurrentUser(userData);
    try {
      storage.setItem('official_store_user_session', JSON.stringify(userData));
    } catch (e) {
      console.warn('Save user session error:', e);
    }
    if (userData?.role === 'admin') {
      handleSaveAdminSession(userData);
    }
  };

  // Deteksi Domain / URL khusus Admin (misal: admin.aspartech.com atau ?admin=1 atau /admin)
  const isAdminDomain = (() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const host = (window.location.hostname || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      return (
        host.startsWith('admin.') ||
        path.startsWith('/admin') ||
        search.includes('admin=1') ||
        search.includes('mode=admin')
      );
    }
    return false;
  })();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressReturnTarget, setAddressReturnTarget] = useState(null);
  const [voucherReturnTarget, setVoucherReturnTarget] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  const handleOpenVoucherFromCheckout = handleOpenVoucher;

  const handleOpenVoucherFromCart = () => {
    setIsCartOpen(false);
    setVoucherReturnTarget('cart');
    setIsVoucherOpen(true);
  };

  const handleCloseVoucher = () => {
    setIsVoucherOpen(false);
    if (voucherReturnTarget === 'checkout') {
      setIsCheckoutOpen(true);
    } else if (voucherReturnTarget === 'cart') {
      setIsCartOpen(true);
    }
    setVoucherReturnTarget(null);
  };

  const handleSelectVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    handleCloseVoucher();
  };

  // Inject Base64 Ionicons font & Global Scrollbar Hiding CSS on Web
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

            /* Sembunyikan Scrollbar secara global di seluruh browser (Chrome, Edge, Safari, Firefox) */
            ::-webkit-scrollbar {
              display: none !important;
              width: 0px !important;
              height: 0px !important;
              background: transparent !important;
            }
            * {
              -ms-overflow-style: none !important;  /* IE and Edge */
              scrollbar-width: none !important;  /* Firefox */
            }

            /* Desktop & Web Smooth Animation Keyframes */
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(16px) scale(0.985);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            @keyframes modalPopIn {
              from {
                opacity: 0;
                transform: scale(0.94) translateY(14px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }

            @keyframes pulseBadge {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15); }
            }

            @keyframes floatSubtle {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }

            /* Micro-Interactions & Hover Smoothness */
            div, button, a {
              transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
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
    cartTotal,
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
  const filteredProducts = (Array.isArray(productList) ? productList : []).filter((product) => {
    if (!product) return false;
    const matchesCategory =
      selectedCategory === 'all' || selectedCategory === 'Semua' || product.category === selectedCategory;
    const matchesSearch =
      (product.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (product.sku && String(product.sku).toLowerCase().includes((searchQuery || '').toLowerCase()));
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

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedAddress(null);
    try {
      storage.removeItem('official_store_user_session');
    } catch (e) {
      console.warn('Remove user session error:', e);
    }
  };

  // Render view based on Active Bottom Tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'belanja':
      case 'explore':
        return (
          <ExploreScreen
            products={productList}
            favorites={favorites}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
            getItemQuantity={getItemQuantity}
            openSearch={() => setIsSearchOpen(true)}
            openCart={() => setIsCartOpen(true)}
            cartCount={totalCartCount}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onSelectProduct={(product) => setSelectedProduct(product)}
          />
        );
      case 'promo':
        return (
          <PromoScreen
            products={productList}
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
            getItemQuantity={getItemQuantity}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            openSearch={() => setIsSearchOpen(true)}
            openCart={() => setIsCartOpen(true)}
            cartCount={totalCartCount}
            onSelectProduct={(product) => setSelectedProduct(product)}
          />
        );
      case 'wishlist':
        return (
          <WishlistScreen
            favorites={favorites}
            onAddToCart={addToCart}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onSelectProduct={(product) => setSelectedProduct(product)}
          />
        );
      case 'pesanan':
        return (
          <OrdersScreen
            openSearch={() => setIsSearchOpen(true)}
            openCart={() => setIsCartOpen(true)}
            cartCount={totalCartCount}
            onAddToCart={addToCart}
            onGoToShop={() => setActiveTab('belanja')}
            user={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        );
      case 'akun':
      case 'profile':
        return (
          <ProfileScreen
            user={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            onOpenAddress={() => setIsAddressOpen(true)}
            onGoToOrders={() => setActiveTab('pesanan')}
            openSearch={() => setIsSearchOpen(true)}
            openCart={() => setIsCartOpen(true)}
            cartCount={totalCartCount}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        );
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
            selectedCategory={selectedCategory}
            onScrollStateChange={setIsScrolled}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onSelectProduct={(product) => setSelectedProduct(product)}
            user={currentUser}
            onGoToShop={() => setActiveTab('belanja')}
          />
        );
    }
  };

  // Jika diakses dari domain khusus Admin (misal: admin.aspartech.com atau ?admin=1)
  if (isAdminDomain) {
    if (!adminUser) {
      return (
        <AdminAuthScreen
          onLoginSuccess={(adm) => handleSaveAdminSession(adm)}
          isStandaloneDomain={true}
        />
      );
    }
    return (
      <AdminDashboardScreen
        visible={true}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        showGoToStore={false}
        onRefreshProducts={handleRefresh}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.primaryRed} />

      {/* Animated E-Commerce Splash Screen */}
      {showSplash && <SplashScreen storeSettings={storeSettings} onFinish={() => setShowSplash(false)} />}

      {/* Header (Continuous on Desktop, Home-only on Mobile) */}
      {(isDesktop || activeTab === 'home') && (
        <Header
          storeSettings={storeSettings}
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          favoriteCount={favoriteCount}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      )}

      {/* Active Screen View (Centered Container on Desktop) */}
      <View style={[styles.mainContent, isDesktop && styles.desktopMainWrapper]}>
        <PageTransition activeTab={activeTab}>
          {renderTabContent()}
        </PageTransition>
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

      {/* Shopping Cart Modal */}
      <CartModal
        visible={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        totalAmount={cartTotal}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onOpenAddress={handleOpenAddressFromCart}
        onOpenVoucher={handleOpenVoucherFromCart}
        selectedVoucher={selectedVoucher}
        selectedAddress={selectedAddress}
      />

      {/* Checkout Screen Modal */}
      <CheckoutScreen
        visible={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        totalAmount={cartTotal}
        selectedAddress={selectedAddress}
        selectedVoucher={selectedVoucher}
        onOpenAddress={handleOpenAddressFromCheckout}
        onOpenVoucher={handleOpenVoucherFromCheckout}
        onOrderSuccess={() => {
          clearCart();
          setSelectedVoucher(null);
        }}
      />

      {/* Voucher Selection Modal */}
      <VoucherScreen
        visible={isVoucherOpen}
        onClose={handleCloseVoucher}
        onSelectVoucher={(v) => {
          setSelectedVoucher(v);
          handleCloseVoucher();
        }}
        selectedVoucher={selectedVoucher}
        cartTotal={cartTotal}
      />

      {/* Address Selection & Creation Modal */}
      <AddressModal
        visible={isAddressOpen}
        onClose={handleCloseAddress}
        onSelectAddress={(addr) => {
          setSelectedAddress(addr);
          handleCloseAddress();
        }}
        selectedAddress={selectedAddress}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Detail Produk Modal Overlay */}
      <ProductDetailModal
        visible={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        onUpdateQuantity={updateQuantity}
        cartQuantity={selectedProduct ? getItemQuantity(selectedProduct.id) : 0}
        isFavorite={selectedProduct ? isFavorite(selectedProduct.id) : false}
        onToggleFavorite={toggleFavorite}
        openCart={() => {
          setSelectedProduct(null);
          setIsCartOpen(true);
        }}
        cartCount={totalCartCount}
        onBuyNow={(prod) => {
          setSelectedProduct(null);
          setIsCheckoutOpen(true);
        }}
      />

      {/* User Auth Modal (Login / Register) */}
      <AuthModal
        visible={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => {
          handleSaveUserSession(userData);
          setIsAuthOpen(false);
        }}
      />

      {/* Admin Dashboard / Auth Guard Screen Modal */}
      {isAdminOpen && (
        adminUser || currentUser?.role === 'admin' ? (
          <AdminDashboardScreen
            visible={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            onRefreshProducts={handleRefresh}
            onUpdateStoreSettings={(newSet) => setStoreSettings(newSet)}
            adminUser={adminUser || currentUser}
            onLogout={() => {
              handleAdminLogout();
              setIsAdminOpen(false);
            }}
          />
        ) : (
          <Modal visible={isAdminOpen} animationType="slide" onRequestClose={() => setIsAdminOpen(false)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
              <TouchableOpacity
                onPress={() => setIsAdminOpen(false)}
                style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 }}
              >
                <Ionicons name="close-circle" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <AdminAuthScreen
                onLoginSuccess={(adm) => {
                  handleSaveAdminSession(adm);
                }}
              />
            </SafeAreaView>
          </Modal>
        )
      )}

      {/* Bottom 5-Tab Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.primaryRed,
    paddingTop: StatusBar.currentHeight || 0,
  },
  mainContent: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#F8FAFC',
    paddingBottom: Platform.OS === 'web' ? 64 : 0,
  },
  desktopMainWrapper: {
    width: '100%',
    flex: 1,
    minHeight: '100vh',
    paddingBottom: 0,
  },
});
