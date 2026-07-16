import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Radii, Shadow, Type } from '../../constants/theme';
import type { Product } from '../../data/seed';
import { Palette, useColors } from '../../lib/theme';

// Product card per UI reference: white card, product photo, heart top-right, name + GHS price below.
type Props = { product: Product; liked: boolean; onToggleLike: () => void; onPress: () => void };

export function ProductCard({ product, liked, onToggleLike, onPress }: Props) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View style={[styles.imageBox, Shadow.card]}>
        <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" transition={250} />
        <Pressable
          onPress={(e) => {
            // Prevent the outer card press from stealing the favourite toggle.
            e?.stopPropagation?.();
            onToggleLike();
          }}
          hitSlop={12}
          style={styles.heart}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? C.heart : C.textLight}
          />
        </Pressable>
      </View>
      <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>GH₵{product.price.toLocaleString()}</Text>
    </Pressable>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: { flex: 1 },
  imageBox: {
    backgroundColor: C.card, borderRadius: Radii.md, height: 190,
    overflow: 'hidden',
  },
  image: { flex: 1, margin: 14, borderRadius: 8 },
  heart: {
    position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
  },
  name: { ...Type.body, fontWeight: '600', color: C.text, marginTop: 10 },
  price: { ...Type.price, color: C.text, marginTop: 2 },
});
