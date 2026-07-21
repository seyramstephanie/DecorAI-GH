// Reactive store — favourites, saved designs, generation handoff.
// Persists favourites + saved designs so they survive restarts.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { GenerationResult } from './ai';

export type SavedDesign = {
  id: string;
  imageBase64: string;
  items: string[];
  eventType: string;
  style: string;
  vision: string;
  createdAt: string;
  /** Original room photo when available — used to re-open edit / regenerate. */
  photoB64?: string;
};

type State = {
  favourites: string[];
  saved: SavedDesign[];
  variants: GenerationResult[];
  brief: { eventType: string; style: string; vision: string; photoB64: string } | null;
  prefs: { darkMode: boolean; notifications: boolean };
  hydrated: boolean;
};

const STORAGE_KEY = 'decorai.store.v1';

let state: State = {
  favourites: [],
  saved: [],
  variants: [],
  brief: null,
  prefs: { darkMode: false, notifications: true },
  hydrated: false,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      favourites: state.favourites,
      saved: state.saved,
      prefs: state.prefs,
    }));
  } catch { /* ignore */ }
}

export async function hydrateStore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...state,
        favourites: Array.isArray(parsed.favourites) ? parsed.favourites : [],
        saved: Array.isArray(parsed.saved) ? parsed.saved : [],
        prefs: {
          darkMode: Boolean(parsed.prefs?.darkMode),
          notifications: parsed.prefs?.notifications !== false,
        },
        hydrated: true,
      };
    } else {
      state = { ...state, hydrated: true };
    }
  } catch {
    state = { ...state, hydrated: true };
  }
  emit();
}

// Kick off hydrate once on import
void hydrateStore();

export const useStore = () => useSyncExternalStore(subscribe, () => state);

export const actions = {
  toggleFavourite(id: string) {
    const has = state.favourites.includes(id);
    state = {
      ...state,
      favourites: has ? state.favourites.filter((f) => f !== id) : [...state.favourites, id],
    };
    emit();
    void persist();
  },
  setBrief(brief: State['brief']) { state = { ...state, brief, variants: [] }; emit(); },
  addVariant(v: GenerationResult) { state = { ...state, variants: [...state.variants, v] }; emit(); },
  /** Load a saved design into the result screen without regenerating. */
  openSavedForEdit(d: SavedDesign) {
    const photoB64 = d.photoB64 || d.imageBase64;
    const variant: GenerationResult = {
      imageBase64: d.imageBase64,
      items: Array.isArray(d.items) ? d.items : [],
      analysis: {
        roomType: 'space',
        structures: [],
        placementZones: [],
        lighting: '',
        existingPalette: [],
      },
      attempts: 1,
    };
    state = {
      ...state,
      brief: {
        eventType: d.eventType || 'Home Interior',
        style: d.style || 'Modern',
        vision: d.vision || '',
        photoB64,
      },
      variants: [variant],
    };
    emit();
  },
  saveDesign(d: SavedDesign) {
    // de-dupe by identical image payload if already saved
    const exists = state.saved.some((s) => s.imageBase64 === d.imageBase64);
    if (exists) return;
    // Prefer explicit photoB64; fall back to current brief original photo
    const withPhoto: SavedDesign = {
      ...d,
      photoB64: d.photoB64 || state.brief?.photoB64,
    };
    state = { ...state, saved: [withPhoto, ...state.saved] };
    emit();
    void persist();
  },
  setPref(key: keyof State['prefs'], value: boolean) {
    state = { ...state, prefs: { ...state.prefs, [key]: value } };
    emit();
    void persist();
  },
  removeDesign(id: string) {
    state = { ...state, saved: state.saved.filter((s) => s.id !== id) };
    emit();
    void persist();
  },
};
