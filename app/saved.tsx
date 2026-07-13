import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/ui/BottomNav';
import { EmptyState } from '../components/ui/ScreenHeader';
import { Radii, Shadow, Type } from '../constants/theme';
import { actions, useStore } from '../lib/store';
import { Palette, useColors } from '../lib/theme';

// FR-13 — saved decoration designs
export default function Saved() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { saved } = useStore();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Saved designs</Text>
      <FlatList
        data={saved}
        keyExtractor={(d) => d.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No saved designs yet"
            body="Generate a decoration preview and save the ones you love."
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={{ flex: 1 }}>
            <View style={[styles.card, Shadow.card]}>
              <Image
                source={{ uri: `data:image/png;base64,${item.imageBase64}` }}
                style={styles.image} contentFit="cover" transition={250}
              />
              <Pressable style={styles.remove} onPress={() => actions.removeDesign(item.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color={C.white} />
              </Pressable>
            </View>
            <Text numberOfLines={1} style={styles.caption}>{item.eventType} · {item.style}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </Animated.View>
        )}
      />
      <BottomNav />
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  title: { ...Type.hero, color: C.text, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18 },
  grid: { paddingHorizontal: 20, paddingBottom: 20, gap: 16, flexGrow: 1 },
  card: { borderRadius: Radii.md, overflow: 'hidden', height: 180, backgroundColor: C.cardMuted },
  image: { flex: 1 },
  remove: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center',
  },
  caption: { ...Type.body, fontWeight: '600', color: C.text, marginTop: 8 },
  date: { ...Type.caption, color: C.textLight, marginTop: 2 },
});
