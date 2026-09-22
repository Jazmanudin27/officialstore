import { Platform } from 'react-native';

const memoryStore = new Map();

export const storage = {
  getItem: (key) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStore.get(key) || null;
    } catch (e) {
      console.warn('Storage getItem warning:', e);
      return memoryStore.get(key) || null;
    }
  },
  setItem: (key, value) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      memoryStore.set(key, value);
    } catch (e) {
      console.warn('Storage setItem warning:', e);
      memoryStore.set(key, value);
    }
  },
  removeItem: (key) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      memoryStore.delete(key);
    } catch (e) {
      console.warn('Storage removeItem warning:', e);
      memoryStore.delete(key);
    }
  },
};
