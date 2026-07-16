import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Type } from '../constants/theme';
import { api } from '../lib/api';
import { Palette, useColors } from '../lib/theme';

const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/** Gmail app-password flow — only MAIL_USERNAME + MAIL_PASSWORD needed on the API. */
export default function ForgotPassword() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!emailValid(email)) {
      Alert.alert('Email', 'Enter the email on your account.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post<{ ok: boolean; message: string; devCode?: string }>('/auth/forgot-password', { email });
      setStep('code');
      if (res.devCode) {
        Alert.alert('Dev mode', `Mail not configured — use code ${res.devCode}`);
        setCode(res.devCode);
      } else {
        Alert.alert('Check your inbox', res.message);
      }
    } catch (e: unknown) {
      Alert.alert('Could not send', String((e as Error).message));
    } finally { setBusy(false); }
  };

  const reset = async () => {
    if (code.trim().length < 4 || password.length < 4) {
      Alert.alert('Check fields', 'Enter the 6-digit code and a new password (min 4 chars).');
      return;
    }
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { email, code, password });
      Alert.alert('Password updated', 'Sign in with your new password.', [
        { text: 'OK', onPress: () => router.replace('/create-account') },
      ]);
    } catch (e: unknown) {
      const msg = String((e as Error).message);
      Alert.alert('Reset failed', msg.includes('400') ? 'Invalid or expired code.' : msg);
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Forgot password" />
      <View style={styles.body}>
        <Text style={styles.lead}>
          We email a one-time code via Gmail. On the server, set MAIL_USERNAME and a Gmail App Password as MAIL_PASSWORD.
        </Text>
        <Field
          label="Account email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@gmail.com"
          valid={emailValid(email)}
          keyboardType="email-address"
        />
        {step === 'code' && (
          <>
            <Field label="Reset code" value={code} onChangeText={setCode} placeholder="6-digit code" keyboardType="number-pad" />
            <Field label="New password" value={password} onChangeText={setPassword} placeholder="New password" secure />
          </>
        )}
        <Button
          title={step === 'email' ? 'Send reset code' : 'Update password'}
          loading={busy}
          onPress={step === 'email' ? sendCode : reset}
          style={{ marginTop: 24, borderRadius: 28 }}
        />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 24, paddingTop: 8 },
  lead: { ...Type.body, color: C.textMuted, marginBottom: 16, lineHeight: 20 },
});
