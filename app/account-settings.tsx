import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Type } from '../constants/theme';
import { api } from '../lib/api';
import { session } from '../lib/session';
import { Palette, useColors } from '../lib/theme';

const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Placeholder defaults ("Guest", "Kumasi") stay out of the inputs — fields start
// empty until the user has real details, and the placeholder does the guiding.
const real = (v: string | undefined, ...defaults: string[]) =>
  !v || defaults.includes(v) ? '' : v;

// FR-06 — profile management
export default function AccountSettings() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const user = session.user;
  const [name, setName] = useState(real(user?.name, 'Guest'));
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [location, setLocation] = useState(real(user?.location, 'Kumasi'));
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!user) return router.back();
    setBusy(true);
    // only send what the user actually filled in
    const fields = Object.fromEntries(
      Object.entries({ name, email, phone, location, password }).filter(([, v]) => v.trim()),
    );
    await api.patch(`/users/${user.id}`, fields).catch(() => {});
    const { password: _pw, ...profile } = fields;
    session.set({ ...user, ...profile });
    setBusy(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Account settings" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Your full name" valid={name.trim().length > 2} />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" valid={emailValid(email)} keyboardType="email-address" />
        <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+233 ..." valid={phone.trim().length >= 9} keyboardType="phone-pad" />
        <Field label="Location" value={location} onChangeText={setLocation} placeholder="City" valid={location.trim().length > 2} />
        <Field label="New password" value={password} onChangeText={setPassword} placeholder="Leave blank to keep current" secure />

        <Button title="Save changes" loading={busy} onPress={save} style={{ marginTop: 28, borderRadius: 28 }} />

        <Text style={styles.aboutTitle}>About</Text>
        <Text style={styles.about}>DecorAI GH v1.0.0{'\n'}CodeQuest 2026 — Group 17{'\n'}Visualise It. Source It. Make It Beautiful.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 24, paddingBottom: 40 },
  aboutTitle: { ...Type.subtitle, color: C.text, marginTop: 32, marginBottom: 6 },
  about: { ...Type.caption, color: C.textLight, lineHeight: 18 },
});
