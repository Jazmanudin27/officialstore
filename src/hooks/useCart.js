import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { storage } from '../utils/storage';

export function useCart(user = null) {
  const [cartItems, setCartItems] = useState([]);
  const userId = user?.id || null;
  const isLoadedRef = useRef(false);

  // Load user cart from Database API whenever user logged in changes
  useEffect(() => {
    isLoadedRef.current = false;
    if (!userId) {
      setCartItems([]);
      isLoadedRef.current = true;
      return;
    }

    let isMounted = true;
    apiService.getUserCart(userId).then((items) => {
      if (isMounted) {
        setCartItems(Array.isArray(items) ? items : []);
        isLoadedRef.current = true;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Persist cart to Database whenever cartItems updates (only after initial load)
  useEffect(() => {
    if (isLoadedRef.current && userId) {
      apiService.saveUserCart(userId, cartItems);
    }
  }, [cartItems, userId]);

  const addToCart = (product) => {
    if (!product) return;
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
    if (userId) {
      apiService.saveUserCart(userId, []);
    }
  };

  const removePurchasedItems = (purchasedItems) => {
    if (!Array.isArray(purchasedItems) || purchasedItems.length === 0) {
      clearCart();
      return;
    }
    const purchasedIds = new Set(purchasedItems.map((item) => item.id));
    setCartItems((prevCart) => prevCart.filter((item) => !purchasedIds.has(item.id)));
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);

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
    removePurchasedItems,
    getItemQuantity,
    totalCartCount,
    subtotal,
    cartTotal: subtotal,
  };
}
