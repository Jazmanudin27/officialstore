import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GRID_CATEGORIES } from '../../data/mockProducts';
import { COLORS } from '../../constants/theme';

export default function CategoryGrid({ onSelectCategory }) {
  return (
    <View style={styles.gridContainer}>
      {GRID_CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={styles.gridItem}
          onPress={() => onSelectCategory(cat.id)}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={cat.icon} size={24} color={COLORS.primaryRed} />
            {cat.badge && (
              <View style={[styles.badge, { backgroundColor: cat.badgeBg || COLORS.primaryRed }]}>
                <Text style={styles.badgeText}>{cat.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.catName} numberOfLines={2}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  gridItem: {
    width: '20%', // 5 items per row
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  badge: {
    position: 'absolute',
    top: -4,
    left: -4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '800',
  },
  catName: {
    color: COLORS.textDark,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
