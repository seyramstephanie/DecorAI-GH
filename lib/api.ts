// Gateway client — every backend call goes through the Spring API (:4000).
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// On a real phone "localhost" is the phone itself, so the backend looked offline even
// while it was running on the computer. The Expo dev server's hostUri carries the
// computer's LAN IP — reuse it. Fallbacks: Android emulator loopback, then localhost;
// EXPO_PUBLIC_API_URL still overrides everything.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (devHost && `http://${devHost}:4000`) ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  // Only attach JSON content-type when we actually send a body (some stacks reject GET+JSON).
  if (method !== 'GET' && method !== 'HEAD' && options.body != null) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Network error talking to ${API_BASE}: ${msg}`);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
  if (!text || !text.trim()) {
    // Empty success body — treat as empty JSON for list endpoints
    return [] as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON from ${path}: ${text.slice(0, 120)}`);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};

// ---- Shared shapes (mirror Java API) ----
export type Shop = {
  id: string; name: string; category: string; location: string; area: string;
  lat: number; lng: number; distanceKm?: number; rating: number; reviews: number;
  phone: string; stock: string[]; radiusKm: number; verified: boolean; image?: string;
  userId?: string;
};
export type Decorator = {
  id: string; name: string; businessName: string; location: string; lat: number; lng: number;
  rating: number; reviews: number; specialisations: string[]; priceRange: string;
  verified: boolean; bio: string; portfolio: string[]; phone: string; userId?: string;
};
export type Thread = {
  threadId: string; title: string; decoratorId: string | null; lastText: string; at: string;
};
export type Booking = {
  id: string; decoratorId: string; decoratorName: string; clientId: string; clientName: string;
  eventType: string; eventDate: string; venue: string; budget: string;
  designImage?: string; brief: string;
  status: 'Enquiry' | 'Confirmed' | 'In Preparation' | 'Completed';
  createdAt: string;
};
export type Message = {
  id: string; bookingId: string; from: string; fromName: string; text: string; at: string;
};
export type Notification = {
  id: string; userId: string; type: 'radius' | 'brief' | 'booking' | 'digest' | 'stock';
  title: string; body: string; at: string; read: boolean;
};

export type BillingInit = {
  reference: string;
  authorizationUrl: string;
  amount: number;
  currency: string;
  mock?: boolean;
  message?: string;
  accessCode?: string;
};
