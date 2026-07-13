// Gateway client — every backend call goes through the API gateway (:4000).
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// On a real phone "localhost" is the phone itself, so the backend looked offline even
// while it was running on the computer. The Expo dev server's hostUri carries the
// computer's LAN IP — reuse it. Fallbacks: Android emulator loopback, then localhost;
// EXPO_PUBLIC_API_URL still overrides everything.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
const BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (devHost && `http://${devHost}:4000`) ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};

// ---- Shared shapes (mirror server seeds) ----
export type Shop = {
  id: string; name: string; category: string; location: string; area: string;
  lat: number; lng: number; distanceKm?: number; rating: number; reviews: number;
  phone: string; stock: string[]; radiusKm: number; verified: boolean; image?: string;
};
export type Decorator = {
  id: string; name: string; businessName: string; location: string; lat: number; lng: number;
  rating: number; reviews: number; specialisations: string[]; priceRange: string;
  verified: boolean; bio: string; portfolio: string[]; phone: string;
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
