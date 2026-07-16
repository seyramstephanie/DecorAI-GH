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

/** Gmail app-password flow — MAIL_USERNAME + MAIL_PASSWORD on the API. */
export default function ForgotPassword() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');

  const sendCode = async () => {
    if (!emailValid(email)) {
      Alert.alert('Email', 'Enter the email on your account.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post<{ ok: boolean; message: string; devCode?: string; mailed?: boolean }>(
        '/auth/forgot-password',
        { email: email.trim().toLowerCase() },
      );
      setStep('code');
      setHint(res.message || 'Check your email for a 6-digit code.');
      if (res.devCode) {
        setCode(res.devCode);
        Alert.alert(
          res.mailed === false ? 'Email failed — use this code' : 'Reset code',
          `${res.message}\n\nYour code: ${res.devCode}\n\n(Check the API window log for [mail] details.)`,
        );
      } else {
        Alert.alert(
          'Check your inbox',
          `${res.message}\n\nAlso check spam. Open Notifications in the app for a copy of the alert.`,
        );
      }
    } catch (e: unknown) {
      Alert.alert('Could not send', String((e as Error).message));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (code.trim().length < 4) {
      Alert.alert('Code', 'Enter the 6-digit code from your email.');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Password', 'Use at least 4 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password', 'New password and confirmation do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        password,
      });
      Alert.alert(
        'Password updated',
        'You can sign in with your new password. A confirmation was also added to Notifications.',
        [{ text: 'Sign in', onPress: () => router.replace('/create-account') }],
      );
    } catch (e: unknown) {
      const msg = String((e as Error).message);
      Alert.alert('Reset failed', msg.includes('400') ? 'Invalid or expired code. Request a new one.' : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Forgot password" />
      <View style={styles.body}>
        <Text style={styles.lead}>
          Enter your account email. We’ll send a 6-digit code to your inbox (Gmail) and log a message in Notifications.
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
            {!!hint && <Text style={styles.hint}>{hint}</Text>}
            <Field
              label="Reset code"
              value={code}
              onChangeText={setCode}
              placeholder="6-digit code"
              keyboardType="number-pad"
            />
            <Field
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="New password"
              secure
            />
            <Field
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Confirm new password"
              secure
            />
          </>
        )}
        <Button
          title={step === 'email' ? 'Send reset code' : 'Update password'}
          loading={busy}
          onPress={step === 'email' ? sendCode : reset}
          style={{ marginTop: 24, borderRadius: 28 }}
        />
        {step === 'code' && (
          <Button
            title="Resend code"
            variant="ghost"
            loading={busy}
            onPress={sendCode}
            style={{ marginTop: 12, borderRadius: 28 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 24, paddingTop: 8 },
  lead: { ...Type.body, color: C.textMuted, marginBottom: 16, lineHeight: 20 },
  hint: { ...Type.caption, color: C.primary, marginBottom: 10, lineHeight: 18 },
});
