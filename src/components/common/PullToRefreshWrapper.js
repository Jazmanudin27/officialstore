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
      {/* Absolute Floating Pull Refresh Indicator (Does NOT shift layout position) */}
      {(pullDistance > 0 || isRefreshing) && Platform.OS === 'web' && (
        <View
          style={[
            styles.floatingOverlayContainer,
            { top: isRefreshing ? 14 : Math.min(6 + pullDistance * 0.5, 45) },
          ]}
          pointerEvents="none"
        >
          <View style={styles.floatingCapsule}>
            {isRefreshing ? (
              <>
                <ActivityIndicator size="small" color="#D91E28" />
                <Text style={styles.floatingText}>{title}</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name={pullDistance >= 40 ? 'arrow-up-circle' : 'arrow-down-circle'}
                  size={18}
                  color="#D91E28"
                />
                <Text style={styles.floatingText}>
                  {pullDistance >= 40
                    ? 'Lepaskan untuk memuat'
                    : 'Tarik ke bawah untuk memuat'}
                </Text>
              </>
            )}
          </View>
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  floatingOverlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  floatingCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D91E28',
  },
});

