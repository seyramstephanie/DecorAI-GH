// Google & Facebook sign-in via expo-auth-session.
// Set EXPO_PUBLIC_GOOGLE_CLIENT_ID / EXPO_PUBLIC_FACEBOOK_APP_ID in .env to enable the real
// OAuth flows; without them the buttons complete with a mock profile (dev-only build).
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const FACEBOOK_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '';

export type SocialProfile = { name: string; email: string; provider: 'google' | 'facebook' };

export function useGoogleSignIn(onDone: (p: SocialProfile) => void) {
  const [request, , promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_ID || 'dev-placeholder.apps.googleusercontent.com',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });
  return async () => {
    if (!GOOGLE_ID) return onDone({ name: 'Google User', email: 'google.user@gmail.com', provider: 'google' });
    const res = await promptAsync();
    if (res?.type !== 'success' || !res.authentication) return;
    const me = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${res.authentication.accessToken}` },
    }).then((r) => r.json());
    onDone({ name: me.name, email: me.email, provider: 'google' });
    void request; // keep hook order stable
  };
}

export function useFacebookSignIn(onDone: (p: SocialProfile) => void) {
  const [request, , promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_ID || '000000000000000',
  });
  return async () => {
    if (!FACEBOOK_ID) return onDone({ name: 'Facebook User', email: 'fb.user@facebook.com', provider: 'facebook' });
    const res = await promptAsync();
    if (res?.type !== 'success' || !res.authentication) return;
    const me = await fetch(
      `https://graph.facebook.com/me?fields=name,email&access_token=${res.authentication.accessToken}`,
    ).then((r) => r.json());
    onDone({ name: me.name, email: me.email ?? '', provider: 'facebook' });
    void request;
  };
}
