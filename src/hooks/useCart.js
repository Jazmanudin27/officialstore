import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const CART_STORAGE_KEY = 'official_store_cart_items';

export function useCart() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = storage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to restore cart from storage:', e);
      return [];
    }
  });

  // Auto save to persistent storage whenever cartItems state updates
  useEffect(() => {
    try {
      storage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to storage:', e);
    }
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      storage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove cart storage:', e);
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getItemQuantity = (productId) => {
    const item = cartItems.find((i) => i.id === productId || i.sku === productId);
    return item ? item.quantity : 0;
  };

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    totalCartCount,
    subtotal,
    cartTotal: subtotal,
  };
}
