import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Glass, GlassOption } from '../components/ui/Glass';
import { Type } from '../constants/theme';
import { api } from '../lib/api';
import { Role, session, User } from '../lib/session';
import { SocialProfile, useFacebookSignIn, useGoogleSignIn } from '../lib/social-auth';
import { Palette, useColors } from '../lib/theme';

// Role is chosen only at signup — locked for the life of the account.
const ROLES: { role: Exclude<Role, 'admin'>; icon: keyof typeof Ionicons.glyphMap; title: string; sub: string }[] = [
  { role: 'client', icon: 'home-outline', title: 'Client', sub: 'Browse & book' },
  { role: 'decorator', icon: 'color-palette-outline', title: 'Decorator', sub: 'Offer services' },
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
  const [role, setRole] = useState<Exclude<Role, 'admin'>>('client');
  // Decorator self-serve profile (clients see them after admin approval)
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [specialisations, setSpecialisations] = useState('Wedding, Home Interior');
  // Shop self-serve
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('General Decor');
  const [stock, setStock] = useState('vases, cushions, drapes');
  const [busy, setBusy] = useState(false);

  const enter = (user: User) => {
    session.set(user);
    if (user.role === 'admin') router.replace('/admin' as any);
    else if (user.role === 'decorator') router.replace('/decorator-dashboard');
    else if (user.role === 'shop') router.replace('/shop-dashboard');
    else router.replace('/home');
  };

  const parseError = (e: unknown) => {
    const msg = String((e as Error)?.message ?? e);
    try { return JSON.parse(msg.split(':').slice(1).join(':')).error as string; } catch { return null; }
  };

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === 'login') {
        enter(await api.post<User>('/login', { email, password }));
      } else {
        if (!emailValid(email)) { Alert.alert('Check email', 'Enter a valid email address.'); return; }
        if (password.length < 4) { Alert.alert('Password', 'Use at least 4 characters.'); return; }
        const payload: Record<string, unknown> = {
          name: name || 'Guest',
          email,
          password,
          role,
          phone,
          location: location || 'Kumasi',
          provider: 'email',
        };
        if (role === 'decorator') {
          payload.businessName = businessName || `${name || 'My'} Decor`;
          payload.bio = bio || 'Professional decorator on DecorAI GH.';
          payload.priceRange = priceRange || 'Contact for quote';
          payload.specialisations = specialisations.split(',').map((s) => s.trim()).filter(Boolean);
        }
        if (role === 'shop') {
          payload.shopName = shopName || `${name || 'My'} Shop`;
          payload.category = category;
          payload.stock = stock.split(',').map((s) => s.trim()).filter(Boolean);
        }
        const user = await api.post<User>('/register', payload);
        if (role === 'decorator') {
          Alert.alert(
            'Application submitted',
            'Your decorator profile is pending admin approval. You can finish editing details in your studio while you wait.',
          );
        }
        enter(user);
      }
    } catch (e: unknown) {
      const msg = String((e as Error)?.message ?? e);
      const friendly = parseError(e);
      if (msg.includes('409')) {
        Alert.alert('Account exists', friendly ?? 'An account with that email already exists — please log in.');
        setMode('login');
      } else if (msg.includes('401') || msg.includes('400')) {
        Alert.alert(mode === 'login' ? 'Sign in failed' : 'Sign up failed', friendly ?? 'Check your details.');
      } else {
        Alert.alert('Backend offline', 'Start the Java API with npm run server, then try again.');
      }
    } finally { setBusy(false); }
  };

  const social = async (p: SocialProfile) => {
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        ...p,
        role: mode === 'signup' ? role : 'client',
        location: location || 'Kumasi',
        phone: phone || '',
        name: p.name,
      };
      if (mode === 'signup' && role === 'decorator') {
        payload.businessName = businessName || `${p.name} Decor`;
        payload.bio = bio || 'Professional decorator on DecorAI GH.';
        payload.specialisations = specialisations.split(',').map((s) => s.trim()).filter(Boolean);
      }
      // Backend returns existing user (locked role) if email already registered via social.
      enter(await api.post<User>('/register', payload));
    } catch {
      Alert.alert('Sign-in failed', 'Could not complete Google/Facebook sign-in.');
    } finally { setBusy(false); }
  };
  const google = useGoogleSignIn(social);
  const facebook = useFacebookSignIn(social);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <View style={styles.logoMark}><Ionicons name="sparkles" size={26} color={C.onPrimary} /></View>
          <Text style={styles.logoName}>DecorAI GH</Text>
        </View>

        {([
          ['logo-google', 'Continue with Google', google, '#DB4437'],
          ['logo-facebook', 'Continue with Facebook', facebook, '#1877F2'],
        ] as const).map(([icon, label, onPress, tint]) => (
          <Pressable key={label} onPress={onPress} disabled={busy} style={{ marginBottom: 12 }}>
            <Glass isInteractive glassEffectStyle="clear" style={styles.socialBtn}>
              <Ionicons name={icon} size={20} color={tint} style={styles.socialIcon} />
              <Text style={styles.socialLabel}>{label}</Text>
            </Glass>
          </Pressable>
        ))}

        {mode === 'signup' && (
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your full name" valid={name.trim().length > 2} />
        )}
        <Field
          label={mode === 'login' ? 'Email or username' : 'Email'}
          value={email} onChangeText={setEmail} placeholder="you@example.com"
          valid={emailValid(email)} keyboardType="email-address"
        />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="Enter Your Password" secure />

        {mode === 'login' && (
          <Pressable onPress={() => router.push('/forgot-password' as any)} style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        )}

        {mode === 'signup' && (
          <>
            <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+233 24 000 0000" valid={phone.trim().length >= 9} keyboardType="phone-pad" />
            <Field label="City" value={location} onChangeText={setLocation} placeholder="Kumasi" valid={location.trim().length > 2} />

            <Text style={styles.section}>I am signing up as</Text>
            <View style={styles.roles}>
              {ROLES.map((r) => (
                <GlassOption
                  key={r.role}
                  label={r.title}
                  sub={r.sub}
                  active={role === r.role}
                  onPress={() => setRole(r.role)}
                  icon={<Ionicons name={r.icon} size={22} color={role === r.role ? C.primary : C.textMuted} />}
                />
              ))}
            </View>

            {role === 'decorator' && (
              <View style={styles.extra}>
                <Text style={styles.section}>Decorator profile</Text>
                <Text style={styles.hint}>Fill this so clients can discover you after admin approval.</Text>
                <Field label="Business name" value={businessName} onChangeText={setBusinessName} placeholder="Royal Touch Decor" />
                <Field label="Bio" value={bio} onChangeText={setBio} placeholder="What you specialise in…" />
                <Field label="Price range" value={priceRange} onChangeText={setPriceRange} placeholder="GH₵2,000–8,000" />
                <Field label="Specialisations" value={specialisations} onChangeText={setSpecialisations} placeholder="Wedding, Birthday, Corporate" />
              </View>
            )}

            {role === 'shop' && (
              <View style={styles.extra}>
                <Text style={styles.section}>Shop profile</Text>
                <Field label="Shop name" value={shopName} onChangeText={setShopName} placeholder="Adum Blooms & Events" />
                <Field label="Category" value={category} onChangeText={setCategory} placeholder="Florist" />
                <Field label="Stock items" value={stock} onChangeText={setStock} placeholder="flowers, drapes, lights" />
              </View>
            )}
          </>
        )}

        <Button
          title={mode === 'login' ? 'Log in' : 'Create Account'}
          loading={busy} onPress={submit}
          style={{ marginTop: 26, borderRadius: 28 }}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {mode === 'login' ? "Don't Have Account ? " : 'Already Have An Account ? '}
          </Text>
          <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={styles.footerLink}>{mode === 'login' ? 'Please Sign up.' : 'Please Login.'}</Text>
          </Pressable>
        </View>

        {mode === 'login' && (
          <Text style={styles.demo}>
            Demo: seyram@decorai.gh / 1234 (client Pro) · akosua@royaltouch.gh / 1234 (decorator) · admin@decorai.gh / 1234
          </Text>
        )}
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
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 28, height: 56, paddingHorizontal: 20, overflow: 'hidden',
  },
  socialIcon: { position: 'absolute', left: 20 },
  socialLabel: { ...Type.body, fontSize: 15, fontWeight: '600', color: C.text, flex: 1, textAlign: 'center' },
  forgot: { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { ...Type.caption, color: C.primary, fontWeight: '600' },
  section: { ...Type.subtitle, color: C.text, marginTop: 20, marginBottom: 10 },
  hint: { ...Type.caption, color: C.textMuted, marginBottom: 10, lineHeight: 16 },
  roles: { flexDirection: 'row', gap: 10 },
  extra: { marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' },
  footerText: { ...Type.body, color: C.text },
  footerLink: { ...Type.body, fontWeight: '600', color: C.primaryLight },
  demo: { ...Type.caption, color: C.textLight, textAlign: 'center', marginTop: 18, lineHeight: 18 },
});
