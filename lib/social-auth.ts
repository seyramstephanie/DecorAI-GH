// Google sign-in via expo-auth-session (real OAuth when client ID is set).
//
// Why Expo Go needs special handling:
// Google *Web* OAuth clients only allow http(s) redirect URIs.
// Expo Go's makeRedirectUri() produces exp://IP:8081/--/... which Google rejects
// with Error 400: invalid_request (redirect_uri=exp://...).
//
// Fix: in Expo Go we send Google an HTTPS redirect on auth.expo.io (must be
// listed under Authorized redirect URIs), then the AuthSession proxy bounces
// back into Expo Go via exp://.
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB = (process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '').trim();
const GOOGLE_IOS = (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '').trim();
const GOOGLE_ANDROID = (process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '').trim();
const EXPO_OWNER = (process.env.EXPO_PUBLIC_EXPO_OWNER || '').trim().replace(/^@/, '');
const REDIRECT_OVERRIDE = (process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || '').trim();

const APP_SLUG = Constants.expoConfig?.slug || 'DecorAI-GH';
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export type SocialProfile = {
  name: string;
  email: string;
  provider: 'google';
  avatar?: string;
};

export const googleAuthConfigured = Boolean(GOOGLE_WEB || GOOGLE_IOS || GOOGLE_ANDROID);

/** HTTPS proxy URI Google will accept in Expo Go. Must match Google Console exactly. */
export function googleProxyRedirectUri(): string {
  if (REDIRECT_OVERRIDE) return REDIRECT_OVERRIDE;
  if (EXPO_OWNER) return `https://auth.expo.io/@${EXPO_OWNER}/${APP_SLUG}`;
  // Anonymous works only until you add a real Expo account name to .env
  return `https://auth.expo.io/@anonymous/${APP_SLUG}`;
}

function googleRedirectUri(): string {
  if (REDIRECT_OVERRIDE) return REDIRECT_OVERRIDE;
  if (Platform.OS === 'web') {
    return AuthSession.makeRedirectUri({ path: 'oauthredirect' });
  }
  // Expo Go → HTTPS (Google Web client allowlist)
  if (isExpoGo) return googleProxyRedirectUri();
  // Dev build / production → custom scheme
  return AuthSession.makeRedirectUri({
    scheme: 'decoraigh',
    path: 'oauthredirect',
    native: 'decoraigh://oauthredirect',
  });
}

async function profileFromAccessToken(token: string): Promise<SocialProfile> {
  const me = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => {
    if (!r.ok) throw new Error(`Google userinfo ${r.status}`);
    return r.json();
  });
  if (!me.email) {
    throw new Error('Google did not share an email for this account.');
  }
  return {
    name: me.name || me.email,
    email: String(me.email).toLowerCase(),
    provider: 'google',
    avatar: me.picture,
  };
}

function consoleHint(redirectUri: string): string {
  return (
    `In Google Cloud Console → Credentials → your *Web application* OAuth client, add this exact Authorized redirect URI:\n\n${redirectUri}\n\n` +
    `Also set EXPO_PUBLIC_EXPO_OWNER=your-expo-username in .env (no @), then restart with: npx expo start -c`
  );
}

/**
 * Real Google OAuth. Requires EXPO_PUBLIC_GOOGLE_CLIENT_ID (Web client) in .env.
 * Expo Go uses https://auth.expo.io/@owner/slug — add that URI in Google Console.
 */
export function useGoogleSignIn(onDone: (p: SocialProfile) => void) {
  const redirectUri = useMemo(() => googleRedirectUri(), []);
  // Where the proxy should bounce after Google (Expo Go deep link)
  const returnUrl = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        scheme: 'decoraigh',
        path: 'oauthredirect',
      }),
    [],
  );

  // Implicit token response: works with Web client ID without a client secret.
  // (Code exchange would need a secret on installed-app / Expo Go flows.)
  const useImplicit =
    isExpoGo || Platform.OS === 'web' || (!GOOGLE_IOS && !GOOGLE_ANDROID && Boolean(GOOGLE_WEB));

  const [request, response, promptAsync] = Google.useAuthRequest({
    // Prefer platform-specific IDs; fall back to Web only for browser / Expo Go proxy flow
    clientId: GOOGLE_WEB || undefined,
    webClientId: GOOGLE_WEB || undefined,
    iosClientId: GOOGLE_IOS || (isExpoGo ? GOOGLE_WEB : undefined) || undefined,
    androidClientId: GOOGLE_ANDROID || (isExpoGo ? GOOGLE_WEB : undefined) || undefined,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true,
    responseType: useImplicit ? AuthSession.ResponseType.Token : undefined,
    usePKCE: useImplicit ? false : undefined,
  });

  const [busy, setBusy] = useState(false);

  const finish = useCallback(
    async (token: string | undefined | null) => {
      if (!token) {
        Alert.alert('Google sign-in failed', 'No access token returned. Try again.');
        return;
      }
      try {
        const profile = await profileFromAccessToken(token);
        onDone(profile);
      } catch (e) {
        Alert.alert('Google sign-in failed', String((e as Error).message || e));
      }
    },
    [onDone],
  );

  useEffect(() => {
    if (!response) return;
    if (response.type === 'error') {
      const msg = response.error?.message || '';
      const looksLikeRedirect =
        /redirect/i.test(msg) || /invalid_request/i.test(msg) || /mismatch/i.test(msg);
      Alert.alert(
        'Google sign-in failed',
        looksLikeRedirect
          ? consoleHint(redirectUri)
          : msg || 'Check your OAuth client ID and redirect URIs in Google Cloud Console.',
      );
      return;
    }
    if (response.type !== 'success') return;

    const token =
      response.authentication?.accessToken ||
      (response.params as { access_token?: string })?.access_token;

    void finish(token);
  }, [response, finish, redirectUri]);

  return async () => {
    if (!googleAuthConfigured) {
      Alert.alert(
        'Google not configured',
        'Add EXPO_PUBLIC_GOOGLE_CLIENT_ID to your .env (Web client ID from Google Cloud), then restart with: npm start',
      );
      return;
    }
    if (!request) {
      Alert.alert('Please wait', 'Google sign-in is still preparing. Try again in a moment.');
      return;
    }
    if (busy) return;

    if (__DEV__) {
      // Must match Google Cloud Console → Web client → Authorized redirect URIs exactly
      console.log('[Google OAuth] redirect_uri =', redirectUri);
    }

    try {
      setBusy(true);

      // Expo Go: open via AuthSession HTTPS proxy so Google never sees exp://
      if (isExpoGo) {
        const authUrl = await request.makeAuthUrlAsync(Google.discovery);
        const startUrl =
          `${redirectUri}/start?` +
          new URLSearchParams({
            authUrl,
            returnUrl,
          }).toString();

        const result = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);
        if (result.type !== 'success' || !('url' in result) || !result.url) {
          if (result.type === 'cancel' || result.type === 'dismiss') return;
          Alert.alert('Google sign-in failed', 'Authentication did not complete.');
          return;
        }

        const parsed = request.parseReturnUrl(result.url);
        if (parsed.type === 'error') {
          Alert.alert(
            'Google sign-in failed',
            parsed.error?.message || consoleHint(redirectUri),
          );
          return;
        }
        if (parsed.type !== 'success') {
          Alert.alert('Google sign-in failed', 'Authentication did not complete.');
          return;
        }
        const token =
          parsed.authentication?.accessToken ||
          (parsed.params as { access_token?: string })?.access_token;
        await finish(token);
        return;
      }

      await promptAsync();
    } catch (e) {
      const msg = String((e as Error).message || e);
      Alert.alert(
        'Google sign-in failed',
        /redirect|invalid_request|mismatch/i.test(msg) ? consoleHint(redirectUri) : msg,
      );
    } finally {
      setBusy(false);
    }
  };
}
