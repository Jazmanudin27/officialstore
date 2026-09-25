import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PullToRefreshWrapper({
  children,
  onRefresh,
  refreshing = false,
  title = 'Memuat data terbaru...',
  style,
}) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isTopScroll = useRef(true);

  const isRefreshing = refreshing || internalRefreshing;

  const getScrollTop = (e) => {
    if (Platform.OS !== 'web') return 0;
    try {
      if (typeof window !== 'undefined') {
        if (window.scrollY > 5 || window.pageYOffset > 5) return window.scrollY || window.pageYOffset;
      }
      if (e && e.target) {
        let el = e.target;
        while (el && el !== document.body) {
          if (el.scrollTop > 5) return el.scrollTop;
          el = el.parentElement;
        }
      }
    } catch (err) {
      // Fallback
    }
    return 0;
  };

  const handleTouchStart = (e) => {
    if (Platform.OS === 'web') {
      const scrollTop = getScrollTop(e);
      isTopScroll.current = scrollTop <= 5;
      if (e.nativeEvent.touches && e.nativeEvent.touches.length > 0) {
        touchStartY.current = e.nativeEvent.touches[0].pageY;
      } else if (e.nativeEvent.pageY) {
        touchStartY.current = e.nativeEvent.pageY;
      }
    }
  };

  const handleTouchMove = (e) => {
    if (Platform.OS === 'web' && isTopScroll.current && !isRefreshing) {
      let currentY = 0;
      if (e.nativeEvent.touches && e.nativeEvent.touches.length > 0) {
        currentY = e.nativeEvent.touches[0].pageY;
      } else if (e.nativeEvent.pageY) {
        currentY = e.nativeEvent.pageY;
      }

      const dy = currentY - touchStartY.current;
      if (dy > 0) {
        const dist = Math.min(dy * 0.45, 80);
        setPullDistance(dist);
      } else {
        setPullDistance(0);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (Platform.OS === 'web') {
      if (pullDistance >= 40 && !isRefreshing) {
        setInternalRefreshing(true);
        setPullDistance(55);
        if (onRefresh) {
          try {
            await onRefresh();
          } catch (e) {
            console.warn('Pull refresh error:', e);
          }
        }
        setTimeout(() => {
          setInternalRefreshing(false);
          setPullDistance(0);
        }, 600);
      } else {
        setPullDistance(0);
      }
    }
  };

  return (
    <View
      style={[{ flex: 1, position: 'relative' }, style]}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated Pull Down Indicator Header (Web & Mobile Web) */}
      {(pullDistance > 0 || isRefreshing) && Platform.OS === 'web' && (
        <View
          style={[
            styles.pullHeader,
            { height: Math.max(pullDistance, isRefreshing ? 50 : 0) },
          ]}
        >
          {isRefreshing ? (
            <View style={styles.pullHeaderContent}>
              <ActivityIndicator size="small" color="#D91E28" />
              <Text style={styles.pullHeaderText}>{title}</Text>
            </View>
          ) : (
            <View style={styles.pullHeaderContent}>
              <Ionicons
                name={pullDistance >= 40 ? 'arrow-up-circle' : 'arrow-down-circle'}
                size={20}
                color="#D91E28"
              />
              <Text style={styles.pullHeaderText}>
                {pullDistance >= 40
                  ? 'Lepaskan untuk memuat ulang'
                  : 'Tarik ke bawah untuk memuat ulang'}
              </Text>
            </View>
          )}
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pullHeader: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
    zIndex: 999,
  },
  pullHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pullHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D91E28',
  },
});

