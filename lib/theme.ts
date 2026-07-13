// Active palette hook — the Dark Mode toggle (profile) drives this via the store.
// Screens build their styles from useColors() so flipping the switch re-themes live.
import { Colors, DarkColors, Palette } from '../constants/colors';
import { useStore } from './store';

export type { Palette };

export function useColors(): Palette {
  return useStore().prefs.darkMode ? DarkColors : Colors;
}
