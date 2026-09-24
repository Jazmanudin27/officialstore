import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const FAVORITES_STORAGE_KEY = 'official_store_favorites';

export function useFavorites(initialFavorites = ['AB-PCS', 'AR-RTG', 'BB-BALL']) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = storage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialFavorites;
    } catch (e) {
      console.warn('Failed to restore favorites from storage:', e);
      return initialFavorites;
    }
  });

  useEffect(() => {
    try {
      storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to storage:', e);
    }
  }, [favorites]);

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isFavorite = (productId) => favorites.includes(productId);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    favoriteCount: favorites.length,
  };
}
