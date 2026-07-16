import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Type } from '../constants/theme';
import { api, Decorator } from '../lib/api';
import { session } from '../lib/session';
import { Palette, useColors } from '../lib/theme';

const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const real = (v: string | undefined, ...defaults: string[]) =>
  !v || defaults.includes(v) ? '' : v;

/** Profile management — role is never editable here (locked at signup). */
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

  // Decorator self-configuration
  const [decoratorId, setDecoratorId] = useState<string | null>(user?.decoratorId ?? null);
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [specialisations, setSpecialisations] = useState('');
  const [portfolio, setPortfolio] = useState('');

  useEffect(() => {
    if (user?.role !== 'decorator' || !user.id) return;
    api.get<Decorator>(`/me/decorator?userId=${user.id}`)
      .then((d) => {
        setDecoratorId(d.id);
        setBusinessName(d.businessName || '');
        setBio(d.bio || '');
        setPriceRange(d.priceRange || '');
        setSpecialisations((d.specialisations || []).join(', '));
        setPortfolio((d.portfolio || []).join('\n'));
      })
      .catch(() => {});
  }, [user?.id, user?.role]);

  const returnToProfile = () => { router.replace('/profile'); };

  const save = async () => {
    if (!user) { returnToProfile(); return; }
    setBusy(true);
    try {
      const fields = Object.fromEntries(
        Object.entries({ name, email, phone, location, password }).filter(([, v]) => v.trim()),
      );
      const updated = await api.patch<typeof user>(`/users/${user.id}`, fields).catch(() => null);
      if (updated) session.set({ ...user, ...updated, password: undefined } as any);
      else {
        const { password: _pw, ...profile } = fields as any;
        session.set({ ...user, ...profile });
      }

      if (user.role === 'decorator' && decoratorId) {
        await api.patch(`/decorators/${decoratorId}/profile`, {
          name: name || user.name,
          phone,
          location,
          businessName,
          bio,
          priceRange,
          specialisations: specialisations.split(',').map((s) => s.trim()).filter(Boolean),
          portfolio: portfolio.split('\n').map((s) => s.trim()).filter(Boolean),
        }).catch(() => {
          Alert.alert('Profile', 'Account saved, but decorator directory update failed (is the API running?).');
        });
      }
      returnToProfile();
    } finally { setBusy(false); }
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

        {user?.role === 'decorator' && (
          <>
            <Text style={styles.section}>Public decorator profile</Text>
            <Text style={styles.hint}>Clients see this after admin approval. Configure everything yourself.</Text>
            <Field label="Business name" value={businessName} onChangeText={setBusinessName} placeholder="Royal Touch Decor" />
            <Field label="Bio" value={bio} onChangeText={setBio} placeholder="Your story and style…" />
            <Field label="Price range" value={priceRange} onChangeText={setPriceRange} placeholder="GH₵2,000–8,000" />
            <Field label="Specialisations" value={specialisations} onChangeText={setSpecialisations} placeholder="Wedding, Corporate" />
            <Field label="Portfolio image URLs" value={portfolio} onChangeText={setPortfolio} placeholder="One image URL per line" />
          </>
        )}

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
  section: { ...Type.subtitle, color: C.text, marginTop: 22, marginBottom: 4 },
  hint: { ...Type.caption, color: C.textLight, marginBottom: 8, lineHeight: 16 },
  aboutTitle: { ...Type.subtitle, color: C.text, marginTop: 32, marginBottom: 6 },
  about: { ...Type.caption, color: C.textLight, lineHeight: 18 },
});
