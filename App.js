import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

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

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

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

      {/* Top Red Collapsible Header Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        isScrolled={isScrolled}
      />

      {/* Active Screen View */}
      <View style={styles.mainContent}>
        {renderTabContent()}
      </View>

      {/* Sticky Bottom Floating Banner (HARGA SUPER!) */}
      <StickyPromoBanner onOpen={() => setIsCartOpen(true)} />

      {/* Cart Modal View */}
      <CartModal
        visible={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
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
