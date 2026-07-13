import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Radii, Type } from '../constants/theme';
import { api, Message } from '../lib/api';
import { session } from '../lib/session';
import { Palette, useColors } from '../lib/theme';

// FR-23 — real in-app messaging between client and decorator. A thread is either a
// booking id or a direct-message id (dm_<decoratorId>_<clientId>); both parties see
// the same server-side thread, so two signed-in devices genuinely talk to each other.
export default function Chat() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { bookingId, threadId, name } = useLocalSearchParams<{ bookingId?: string; threadId?: string; name?: string }>();
  const thread = threadId || bookingId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const me = session.user?.id ?? 'guest';

  const load = () =>
    api.get<Message[]>(`/bookings/${thread}/messages`).then(setMessages).catch(() => {});

  useEffect(() => {
    load();
    const t = setInterval(load, 2500); // polling keeps both ends in sync
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    try {
      await api.post(`/bookings/${thread}/messages`, { from: me, fromName: session.user?.name ?? 'Guest', text: body });
      load();
    } catch {}
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title={name ?? 'Chat'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const mine = item.from === me;
            return (
              <View style={[styles.bubbleRow, mine && { justifyContent: 'flex-end' }]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.msg, mine && { color: C.onPrimary }]}>{item.text}</Text>
                  <Text style={[styles.time, mine && { color: 'rgba(255,255,255,0.7)' }]}>
                    {new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input} value={text} onChangeText={setText}
            placeholder="Type a message…" placeholderTextColor={C.textLight}
            onSubmitEditing={send} returnKeyType="send"
          />
          <Pressable style={styles.send} onPress={send}>
            <Ionicons name="paper-plane" size={18} color={C.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  list: { paddingHorizontal: 20, paddingBottom: 12, gap: 8, flexGrow: 1 },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '78%', borderRadius: Radii.md, padding: 12, gap: 3 },
  bubbleMine: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: C.card, borderBottomLeftRadius: 4 },
  msg: { ...Type.body, color: C.text, lineHeight: 19 },
  time: { fontSize: 10, color: C.textLight, alignSelf: 'flex-end' },
  inputBar: {
    flexDirection: 'row', gap: 10, padding: 14, backgroundColor: C.card,
    borderTopLeftRadius: Radii.lg, borderTopRightRadius: Radii.lg, alignItems: 'center',
  },
  input: {
    flex: 1, backgroundColor: C.cardMuted, borderRadius: 22, paddingHorizontal: 16,
    height: 44, ...Type.body, color: C.text,
  },
  send: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});
