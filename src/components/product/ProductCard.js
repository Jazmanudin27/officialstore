import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../../utils/formatters';
import { COLORS } from '../../constants/theme';

export default function ProductCard({
  product,
  onAddToCart,
  onUpdateQuantity,
  cartQuantity = 0,
  isFavorite,
  onToggleFavorite,
}) {
  return (
    <View style={styles.card}>
      {/* Image & Badges Container */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
        
        {product.officialBadge && (
          <View style={styles.officialBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />
            <Text style={styles.officialText}>Official</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite(product.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? COLORS.primaryRed : COLORS.textGray}
          />
        </TouchableOpacity>

        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}</Text>
          </View>
        )}
      </View>

      {/* Content Container */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating & Sold Count */}
        <View style={styles.metaRow}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
          <Text style={styles.soldText}>Terjual {product.sold}</Text>
        </View>

        {/* Price Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatRupiah(product.price)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPriceText}>
              {formatRupiah(product.originalPrice)}
            </Text>
          )}
        </View>

        {/* Stepper if in Cart, else "+ Beli" Button */}
        {cartQuantity > 0 ? (
          <View style={styles.cardStepperRow}>
            <TouchableOpacity
              style={styles.cardStepperBtn}
              onPress={() => onUpdateQuantity && onUpdateQuantity(product.id, cartQuantity - 1)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cartQuantity === 1 ? 'trash-outline' : 'remove'}
                size={14}
                color="#D91E28"
              />
            </TouchableOpacity>

            <Text style={styles.cardStepperValue}>{cartQuantity}</Text>

            <TouchableOpacity
              style={styles.cardStepperBtn}
              onPress={() => onUpdateQuantity && onUpdateQuantity(product.id, cartQuantity + 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={14} color="#D91E28" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddToCart(product)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={15} color={COLORS.white} />
            <Text style={styles.addButtonText}>+ Beli</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
    marginHorizontal: 6,
    elevation: 2,
  },
  imageContainer: {
    height: 130,
    width: '100%',
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  officialBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.primaryRed,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  officialText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
  detailsContainer: {
    padding: 10,
    justify: 'space-between',
    flex: 1,
  },
  productName: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  soldText: {
    color: COLORS.textGray,
    fontSize: 10,
  },
  priceContainer: {
    marginBottom: 8,
  },
  priceText: {
    color: COLORS.primaryRed,
    fontSize: 14,
    fontWeight: '800',
  },
  originalPriceText: {
    color: COLORS.textMuted,
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: COLORS.primaryRed,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  cardStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    paddingHorizontal: 4,
    height: 34,
  },
  cardStepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cardStepperValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D91E28',
    minWidth: 20,
    textAlign: 'center',
  },
});
