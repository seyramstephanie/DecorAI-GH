// Google & Facebook via expo-auth-session.
// Paste client IDs into root .env — without them, buttons use a dev mock profile.
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_IOS = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
const GOOGLE_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const FACEBOOK_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '';

export type SocialProfile = {
  name: string;
  email: string;
  provider: 'google' | 'facebook';
  avatar?: string;
};

export function useGoogleSignIn(onDone: (p: SocialProfile) => void) {
  const [request, , promptAsync] = Google.useAuthRequest({
    // Web client ID is required for the token → userinfo flow on all platforms.
    clientId: GOOGLE_WEB || 'dev-placeholder.apps.googleusercontent.com',
    iosClientId: GOOGLE_IOS || undefined,
    androidClientId: GOOGLE_ANDROID || undefined,
    webClientId: GOOGLE_WEB || undefined,
    scopes: ['openid', 'profile', 'email'],
  });

  return async () => {
    if (!GOOGLE_WEB && !GOOGLE_IOS && !GOOGLE_ANDROID) {
      return onDone({
        name: 'Google User',
        email: 'google.user@gmail.com',
        provider: 'google',
      });
    }
    const res = await promptAsync();
    if (res?.type !== 'success' || !res.authentication?.accessToken) return;
    const me = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${res.authentication.accessToken}` },
    }).then((r) => r.json());
    onDone({
      name: me.name || me.email || 'Google User',
      email: me.email,
      provider: 'google',
      avatar: me.picture,
    });
    void request;
  };
}

export function useFacebookSignIn(onDone: (p: SocialProfile) => void) {
  const [request, , promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_ID || '000000000000000',
  });
  return async () => {
    if (!FACEBOOK_ID) {
      return onDone({
        name: 'Facebook User',
        email: 'fb.user@facebook.com',
        provider: 'facebook',
      });
    }
    const res = await promptAsync();
    if (res?.type !== 'success' || !res.authentication?.accessToken) return;
    const me = await fetch(
      `https://graph.facebook.com/me?fields=name,email,picture.type(large)&access_token=${res.authentication.accessToken}`,
    ).then((r) => r.json());
    onDone({
      name: me.name,
      email: me.email ?? '',
      provider: 'facebook',
      avatar: me.picture?.data?.url,
    });
    void request;
  };
}

export const googleAuthConfigured = Boolean(GOOGLE_WEB || GOOGLE_IOS || GOOGLE_ANDROID);
