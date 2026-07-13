// Tiny reactive module store — favourites, saved designs and the in-flight generation
// handoff between generate → result. Dev-only persistence (memory), per spec.
import { useSyncExternalStore } from 'react';
import type { GenerationResult } from './ai';

export type SavedDesign = {
  id: string; imageBase64: string; items: string[]; eventType: string; style: string;
  vision: string; createdAt: string;
};

type State = {
  favourites: string[];          // product ids
  saved: SavedDesign[];          // FR-13 saved designs
  variants: GenerationResult[];  // FR-12 style variants for the current brief
  brief: { eventType: string; style: string; vision: string; photoB64: string } | null;
  prefs: { darkMode: boolean; notifications: boolean };
};

let state: State = {
  favourites: ['p1'], saved: [], variants: [], brief: null,
  prefs: { darkMode: false, notifications: true },
};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

export const useStore = () => useSyncExternalStore(subscribe, () => state);

export const actions = {
  toggleFavourite(id: string) {
    const has = state.favourites.includes(id);
    state = { ...state, favourites: has ? state.favourites.filter((f) => f !== id) : [...state.favourites, id] };
    emit();
  },
  setBrief(brief: State['brief']) { state = { ...state, brief, variants: [] }; emit(); },
  addVariant(v: GenerationResult) { state = { ...state, variants: [...state.variants, v] }; emit(); },
  saveDesign(d: SavedDesign) { state = { ...state, saved: [d, ...state.saved] }; emit(); },
  setPref(key: keyof State['prefs'], value: boolean) {
    state = { ...state, prefs: { ...state.prefs, [key]: value } }; emit();
  },
  removeDesign(id: string) { state = { ...state, saved: state.saved.filter((s) => s.id !== id) }; emit(); },
};
