import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Radii, Shadow, Type } from '../constants/theme';
import { api } from '../lib/api';
import { Role, session, User } from '../lib/session';
import { SocialProfile, useFacebookSignIn, useGoogleSignIn } from '../lib/social-auth';
import { Palette, useColors } from '../lib/theme';

const ROLES: { role: Role; icon: any; title: string; sub: string }[] = [
  { role: 'client', icon: 'home-outline', title: 'Client', sub: 'Plan & decorate' },
  { role: 'decorator', icon: 'color-palette-outline', title: 'Decorator', sub: 'Offer my services' },
  { role: 'shop', icon: 'storefront-outline', title: 'Shop owner', sub: 'List my shop' },
];

const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function Auth() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [busy, setBusy] = useState(false);

  const enter = (user: User) => { session.set(user); router.replace('/home'); };

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === 'login') {
        enter(await api.post<User>('/login', { email, password }));
      } else {
        enter(await api.post<User>('/register', {
          name: name || 'Guest', email, password, role,
          phone, location: location || 'Kumasi',
        }));
      }
    } catch (e: any) {
      const msg = String(e.message);
      const friendly = () => {
        try { return JSON.parse(msg.split(':').slice(1).join(':')).error; } catch { return null; }
      };
      if (msg.includes('409')) {
        Alert.alert('Account exists', friendly() ?? 'An account with that email already exists — please log in.');
        setMode('login');
      } else if (msg.includes('401') || msg.includes('400')) {
        Alert.alert(mode === 'login' ? 'Sign in failed' : 'Sign up failed', friendly() ?? 'Check your details.');
      } else {
        // backend unreachable — dev fallback so the app stays usable offline
        enter({ id: Math.random().toString(36).slice(2, 10), name: name || 'Guest', email, phone, location: location || 'Kumasi', role });
      }
    } finally { setBusy(false); }
  };

  const social = async (p: SocialProfile) => {
    try {
      enter(await api.post<User>('/register', { ...p, role, location: 'Kumasi', phone: '' }));
    } catch {
      enter({ id: Math.random().toString(36).slice(2, 10), phone: '', location: 'Kumasi', role, ...p });
    }
  };
  const google = useGoogleSignIn(social);
  const facebook = useFacebookSignIn(social);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Logo header — per reference */}
        <View style={styles.logoWrap}>
          <View style={styles.logoMark}><Ionicons name="sparkles" size={26} color={C.onPrimary} /></View>
          <Text style={styles.logoName}>DecorAI GH</Text>
        </View>

        {/* Social buttons first — per reference */}
        {([
          ['logo-google', 'Continue with Google', google, '#DB4437'],
          ['logo-facebook', 'Continue with Facebook', facebook, '#1877F2'],
        ] as const).map(([icon, label, onPress, tint]) => (
          <Pressable key={label} onPress={onPress} style={[styles.socialBtn, Shadow.card]}>
            <Ionicons name={icon} size={20} color={tint} style={styles.socialIcon} />
            <Text style={styles.socialLabel}>{label}</Text>
          </Pressable>
        ))}

        {/* Fields */}
        {mode === 'signup' && (
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your full name" valid={name.trim().length > 2} />
        )}
        <Field
          label={mode === 'login' ? 'Email or username' : 'Email'}
          value={email} onChangeText={setEmail} placeholder="you@example.com"
          valid={emailValid(email)} keyboardType="email-address"
        />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="Enter Your Password" secure />

        {/* Signup gathers the rest of the account info for the DB */}
        {mode === 'signup' && (
          <>
            <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+233 24 000 0000" valid={phone.trim().length >= 9} keyboardType="phone-pad" />
            <Field label="City" value={location} onChangeText={setLocation} placeholder="Kumasi" valid={location.trim().length > 2} />
          </>
        )}

        {/* Role picker — signup only (kept from our flow) */}
        {mode === 'signup' && (
          <View style={styles.roles}>
            {ROLES.map((r) => (
              <Pressable key={r.role} onPress={() => setRole(r.role)} style={[styles.roleCard, role === r.role && styles.roleActive]}>
                <Ionicons name={r.icon} size={22} color={role === r.role ? C.primary : C.textMuted} />
                <Text style={[styles.roleTitle, role === r.role && { color: C.primary }]}>{r.title}</Text>
                <Text style={styles.roleSub}>{r.sub}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Button
          title={mode === 'login' ? 'Log in' : 'Create Account'}
          loading={busy} onPress={submit}
          style={{ marginTop: 26, borderRadius: 28 }}
        />

        {/* Footer link — per reference */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {mode === 'login' ? "Don't Have Account ? " : 'Already Have An Account ? '}
          </Text>
          <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={styles.footerLink}>{mode === 'login' ? 'Please Sign up.' : 'Please Login.'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 24, paddingBottom: 48 },
  logoWrap: { alignItems: 'center', marginTop: 18, marginBottom: 28, gap: 10 },
  logoMark: {
    width: 54, height: 54, borderRadius: 18, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoName: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
    borderRadius: 28, borderWidth: 1, borderColor: C.border, height: 56,
    paddingHorizontal: 20, marginBottom: 12,
  },
  socialIcon: { position: 'absolute', left: 20 },
  socialLabel: { ...Type.body, fontSize: 15, fontWeight: '600', color: C.text, flex: 1, textAlign: 'center' },
  roles: { flexDirection: 'row', gap: 10, marginTop: 18 },
  roleCard: {
    flex: 1, backgroundColor: C.card, borderRadius: Radii.md, borderWidth: 1.5,
    borderColor: C.border, padding: 12, alignItems: 'center', gap: 4,
  },
  roleActive: { borderColor: C.primary, backgroundColor: C.accentSoft },
  roleTitle: { ...Type.caption, fontSize: 13, color: C.text, fontWeight: '700' },
  roleSub: { fontSize: 10, color: C.textLight, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  footerText: { ...Type.body, color: C.text },
  footerLink: { ...Type.body, fontWeight: '600', color: C.primaryLight },
});
