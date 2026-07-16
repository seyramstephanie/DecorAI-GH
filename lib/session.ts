// Session mirror of the Java /users payload. Role is locked at signup —
// never mutated client-side except by logging in as a different account.
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
  provider?: 'google' | 'facebook' | 'email';
  plan?: Plan;
  planExpiresAt?: string | null;
  decoratorId?: string | null;
  shopId?: string | null;
  isPro?: boolean;
  canUseAi?: boolean;
};

let current: User | null = null;
const listeners = new Set<() => void>();

export const session = {
  get user() { return current; },
  set(user: User | null) {
    current = user
      ? {
          ...user,
          isPro: user.isPro ?? (user.plan === 'pro' || user.role === 'admin'),
          canUseAi: user.canUseAi ?? (user.plan === 'pro' || user.role === 'admin'),
        }
      : null;
    listeners.forEach((l) => l());
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
    return () => { listeners.delete(fn); };
  },
};
