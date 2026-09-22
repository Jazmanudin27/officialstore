import { useState } from 'react';

export function useFavorites(initialFavorites = ['AB-PCS', 'AR-RTG', 'BB-BALL']) {
  const [favorites, setFavorites] = useState(initialFavorites);

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
