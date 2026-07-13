import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Pill } from '../components/ui/Chip';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Radii, Shadow, Type } from '../constants/theme';
import { Palette, useColors } from '../lib/theme';
import { EVENT_TYPES, PROMPT_TEMPLATES, STYLES } from '../data/seed';
import { actions } from '../lib/store';

export default function Generate() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  // Design-space cards on home preselect the event type
  const params = useLocalSearchParams<{ eventType?: string }>();
  const [photo, setPhoto] = useState<{ uri: string; b64: string } | null>(null);
  const [eventType, setEventType] = useState(
    params.eventType && EVENT_TYPES.includes(params.eventType) ? params.eventType : EVENT_TYPES[0],
  );
  const [style, setStyle] = useState(STYLES[0]);
  const [vision, setVision] = useState('');

  // FR-07 — upload a photo of the space (camera or gallery)
  const pick = async (camera: boolean) => {
    const perm = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const opts = { quality: 0.7 as const, base64: true };
    const res = camera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync({ ...opts, mediaTypes: ['images'] });
    const asset = res.assets?.[0];
    if (asset?.base64) setPhoto({ uri: asset.uri, b64: asset.base64 });
  };

  const start = () => {
    if (!photo) return;
    actions.setBrief({ eventType, style, vision, photoB64: photo.b64 });
    router.push('/result');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Decorate with AI" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Photo upload */}
        {photo ? (
          <View style={[styles.photoBox, Shadow.card]}>
            <Image source={{ uri: photo.uri }} style={styles.photo} contentFit="cover" />
            <Pressable style={styles.retake} onPress={() => setPhoto(null)}>
              <Ionicons name="close" size={18} color={C.white} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.uploadRow}>
            <Pressable style={[styles.upload, Shadow.card]} onPress={() => pick(true)}>
              <Ionicons name="camera-outline" size={26} color={C.primary} />
              <Text style={styles.uploadLabel}>Take photo</Text>
            </Pressable>
            <Pressable style={[styles.upload, Shadow.card]} onPress={() => pick(false)}>
              <Ionicons name="images-outline" size={26} color={C.primary} />
              <Text style={styles.uploadLabel}>From gallery</Text>
            </Pressable>
          </View>
        )}

        {/* FR-08 — event type & style */}
        <Text style={styles.section}>Event type</Text>
        <View style={styles.pills}>
          {EVENT_TYPES.map((e) => <Pill key={e} label={e} active={eventType === e} onPress={() => setEventType(e)} />)}
        </View>

        <Text style={styles.section}>Style</Text>
        <View style={styles.pills}>
          {STYLES.map((s) => <Pill key={s} label={s} active={style === s} onPress={() => setStyle(s)} />)}
        </View>

        {/* FR-09 — template library for the chosen event type */}
        <Text style={styles.section}>Templates</Text>
        {(PROMPT_TEMPLATES[eventType] || []).map((t) => (
          <Pressable
            key={t}
            onPress={() => setVision(t)}
            style={[styles.template, vision === t && styles.templateActive]}
          >
            <Ionicons
              name={vision === t ? 'checkmark-circle' : 'sparkles-outline'}
              size={18} color={vision === t ? C.primary : C.textLight}
            />
            <Text style={[styles.templateText, vision === t && { color: C.text }]}>{t}</Text>
          </Pressable>
        ))}

        {/* FR-10 — custom prompt (templates are editable once selected) */}
        <Text style={styles.section}>Your vision</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe your dream decoration, or tap a template above and edit it…"
          placeholderTextColor={C.textLight}
          value={vision}
          onChangeText={setVision}
          multiline
        />

        <Button title="Generate preview" icon="sparkles" onPress={start} disabled={!photo} style={{ marginTop: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 20, paddingBottom: 40, gap: 4 },
  uploadRow: { flexDirection: 'row', gap: 14 },
  upload: {
    flex: 1, height: 120, borderRadius: Radii.md, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed',
  },
  uploadLabel: { ...Type.caption, color: C.textMuted },
  photoBox: { borderRadius: Radii.md, overflow: 'hidden', height: 220 },
  photo: { flex: 1 },
  retake: {
    position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center',
  },
  section: { ...Type.subtitle, color: C.text, marginTop: 22, marginBottom: 10 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  template: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: C.card,
    borderRadius: Radii.sm, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border,
  },
  templateActive: { borderColor: C.primary, backgroundColor: C.accentSoft },
  templateText: { ...Type.body, color: C.textMuted, flex: 1, lineHeight: 19 },
  input: {
    backgroundColor: C.card, borderRadius: Radii.sm, borderWidth: 1, borderColor: C.border,
    padding: 14, minHeight: 90, textAlignVertical: 'top', ...Type.body, color: C.text,
  },
});
