// In-memory session — no auth system (dev-only, per spec).
export type Role = 'client' | 'decorator' | 'shop';
export type User = {
  id: string; name: string; email: string; phone: string;
  location: string; role: Role; avatar?: string; provider?: 'google' | 'facebook' | 'email';
};

let current: User | null = null;
const listeners = new Set<() => void>();

export const session = {
  get user() { return current; },
  set(user: User | null) { current = user; listeners.forEach((l) => l()); },
  subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
};
