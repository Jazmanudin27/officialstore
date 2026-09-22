import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GRID_CATEGORIES } from '../../data/mockProducts';
import { COLORS } from '../../constants/theme';

export default function CategoryGrid({ selectedCategory = 'all', onSelectCategory }) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {GRID_CATEGORIES.map((cat) => {
          const isSelected =
            (cat.id === 'all' && (selectedCategory === 'all' || selectedCategory === 'Semua')) ||
            selectedCategory === cat.name;

          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catPill, isSelected && styles.catPillActive]}
              onPress={() => onSelectCategory(cat.id === 'all' ? 'all' : cat.name)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon}
                size={15}
                color={isSelected ? COLORS.white : '#475569'}
              />
              <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                {cat.name}
              </Text>
              {cat.badge && (
                <View
                  style={[
                    styles.badge,
                    isSelected ? styles.badgeActive : { backgroundColor: cat.badgeBg || COLORS.primaryRed },
                  ]}
                >
                  <Text style={styles.badgeText}>{cat.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  catPillActive: {
    backgroundColor: '#D91E28',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  catPillTextActive: {
    color: COLORS.white,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 2,
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '800',
  },
});

