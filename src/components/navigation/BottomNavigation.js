import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  if (isDesktop) return null;

  const tabs = [
    { id: 'home', label: 'Beranda', icon: 'home', outlineIcon: 'home-outline' },
    { id: 'belanja', label: 'Belanja', icon: 'storefront', outlineIcon: 'storefront-outline' },
    { id: 'promo', label: 'Promo', icon: 'pricetag', outlineIcon: 'pricetag-outline' },
    { id: 'pesanan', label: 'Pesanan', icon: 'document-text', outlineIcon: 'document-text-outline' },
    { id: 'akun', label: 'Akun', icon: 'person', outlineIcon: 'person-outline' },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.icon : tab.outlineIcon}
              size={22}
              color={isActive ? COLORS.primaryRed : COLORS.textGray}
            />
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 6,
    paddingBottom: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    flexShrink: 0,
    width: '100%',
    zIndex: 100,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textGray,
    marginTop: 2,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: COLORS.primaryRed,
    fontWeight: '800',
  },
});
