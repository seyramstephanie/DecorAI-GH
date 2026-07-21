// Session mirror of the Java /users payload.
// Persisted with AsyncStorage so login survives Expo reloads and app restarts.
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'client' | 'decorator' | 'shop' | 'admin';
export type Plan = 'free' | 'pro';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: Role;
  avatar?: string;
  provider?: 'google' | 'email';
  plan?: Plan;
  planExpiresAt?: string | null;
  decoratorId?: string | null;
  shopId?: string | null;
  isPro?: boolean;
  canUseAi?: boolean;
};

const STORAGE_KEY = 'decorai.session.v1';

let current: User | null = null;
let hydrated = false;
let hydratePromise: Promise<User | null> | null = null;
const listeners = new Set<() => void>();

const ROLES: Role[] = ['client', 'decorator', 'shop', 'admin'];

function emit() {
  listeners.forEach((l) => l());
}

/** Coerce API / storage payloads into a safe User (never store password hashes). */
export function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const u = raw as Record<string, unknown>;

  const id = u.id != null ? String(u.id).trim() : '';
  if (!id) return null;

  const roleRaw = String(u.role ?? 'client').toLowerCase();
  const role = (ROLES.includes(roleRaw as Role) ? roleRaw : 'client') as Role;

  const planRaw = String(u.plan ?? 'free').toLowerCase();
  const plan = (planRaw === 'pro' ? 'pro' : 'free') as Plan;

  const cleaned: User = {
    id,
    name: String(u.name ?? 'User'),
    email: String(u.email ?? ''),
    phone: String(u.phone ?? ''),
    location: String(u.location ?? ''),
    role,
    avatar: u.avatar ? String(u.avatar) : undefined,
    provider: u.provider === 'google' ? 'google' : 'email',
    plan,
    planExpiresAt: u.planExpiresAt == null ? null : String(u.planExpiresAt),
    decoratorId: u.decoratorId != null ? String(u.decoratorId) : u.decorator_id != null ? String(u.decorator_id) : null,
    shopId: u.shopId != null ? String(u.shopId) : u.shop_id != null ? String(u.shop_id) : null,
    isPro: Boolean(u.isPro ?? (plan === 'pro' || role === 'admin')),
    canUseAi: Boolean(u.canUseAi ?? (plan === 'pro' || role === 'admin')),
  };

  return cleaned;
}

async function writeStorage(user: User | null) {
  try {
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn('[session] persist failed', e);
  }
}

export async function hydrateSession(): Promise<User | null> {
  // Single-flight: concurrent callers share one load
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = null;
        }
        const user = normalizeUser(parsed);
        if (user) {
          current = user;
        } else {
          current = null;
          await AsyncStorage.removeItem(STORAGE_KEY);
          console.warn('[session] cleared invalid stored session');
        }
      } else {
        current = null;
      }
    } catch (e) {
      console.warn('[session] hydrate failed', e);
      current = null;
    } finally {
      hydrated = true;
      hydratePromise = null;
      emit();
    }
    return current;
  })();

  return hydratePromise;
}

// Start hydrate ASAP on import
void hydrateSession();

export const session = {
  get user() {
    return current;
  },
  get hydrated() {
    return hydrated;
  },
  /**
   * Update in-memory session and persist.
   * Returns a Promise so login can await the write before navigating.
   */
  set(user: User | null): Promise<void> {
    current = user ? normalizeUser(user) : null;
    // If normalize rejected a bad payload, treat as logout
    if (user && !current) {
      console.warn('[session] set() rejected invalid user payload');
    }
    emit();
    return writeStorage(current);
  },
  /** Free clients may browse + message only; Pro unlocks Decorate with AI. */
  canUseAi() {
    if (!current) return false;
    if (current.role === 'admin') return true;
    if (current.canUseAi) return true;
    if (current.plan !== 'pro') return false;
    if (!current.planExpiresAt) return true;
    return new Date(current.planExpiresAt).getTime() > Date.now();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
