import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavSpacer } from '../components/ui/BottomNav';
import { EmptyState, ScreenHeader } from '../components/ui/ScreenHeader';
import { Radii, Shadow, Type } from '../constants/theme';
import { api, Thread } from '../lib/api';
import { session } from '../lib/session';
import { Palette, useColors } from '../lib/theme';

// Inbox — every conversation this account takes part in. Clients see the decorators
// they've messaged; decorator accounts see their incoming client threads.
export default function Messages() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [error, setError] = useState(false);
  const user = session.user;

  useEffect(() => {
    const load = () =>
      api.get<Thread[]>(`/threads?userId=${encodeURIComponent(user?.id ?? 'guest')}&phone=${encodeURIComponent(user?.phone ?? '')}`)
        .then((t) => { setThreads(t); setError(false); })
        .catch(() => setError(true));
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [user?.id, user?.phone]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Messages" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error && <EmptyState icon="cloud-offline-outline" title="Backend offline" body="Start it with: npm run server." />}
        {!error && threads.length === 0 && (
          <EmptyState icon="chatbubbles-outline" title="No conversations yet"
            body="Message a decorator from their profile and the conversation will appear here." />
        )}
        {threads.map((t, i) => (
          <Animated.View key={t.threadId} entering={FadeInDown.delay(i * 50).duration(350)}>
            <Pressable
              style={[styles.card, Shadow.card]}
              onPress={() => router.push({ pathname: '/chat', params: { threadId: t.threadId, name: t.title } })}
            >
              <View style={styles.avatar}><Ionicons name="chatbubble-ellipses" size={20} color={C.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{t.title}</Text>
                <Text style={styles.preview} numberOfLines={1}>{t.lastText}</Text>
              </View>
              <Text style={styles.time}>
                {new Date(t.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
      <BottomNavSpacer />
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card,
    borderRadius: Radii.md, padding: 14,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { ...Type.subtitle, fontSize: 15, color: C.text },
  preview: { ...Type.caption, color: C.textMuted, marginTop: 2 },
  time: { fontSize: 11, color: C.textLight },
});
