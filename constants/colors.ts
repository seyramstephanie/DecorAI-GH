// DecorAI GH design language — warm terracotta, per UI reference.
// Two palettes share one shape; components pick the active one via useColors().
export const Colors = {
  primary:      '#9A4A1F',   // burnt sienna — active buttons, bottom-nav pill
  primaryLight: '#C1653B',   // terracotta — accents, highlights
  terracotta:   '#C96F45',   // page hero / backdrop tone
  accent:       '#E8842C',   // amber — counters, notification badge
  accentSoft:   '#F6E3D3',   // pale peach — chip backgrounds, soft fills
  bg:           '#FAF7F4',   // warm off-white app background
  white:        '#FFFFFF',
  onPrimary:    '#FFFFFF',   // text/icons on primary-coloured surfaces
  card:         '#FFFFFF',
  cardMuted:    '#F4F1EE',   // product-card grey backdrop
  border:       '#EDE7E1',
  text:         '#1F1A16',   // near-black warm text
  textMuted:    '#8A7F76',
  textLight:    '#B5ACA4',
  heart:        '#E5484D',   // favourite heart red
  success:      '#2E9E5B',
  danger:       '#E5484D',
  overlay:      'rgba(31,26,22,0.45)',
};

export type Palette = typeof Colors;

// Dark mode — same warm terracotta language on deep coffee surfaces.
export const DarkColors: Palette = {
  primary:      '#C1653B',   // brighter for contrast on dark surfaces
  primaryLight: '#D97C52',
  terracotta:   '#C96F45',
  accent:       '#F0913A',
  accentSoft:   '#3B2B20',
  bg:           '#16110D',
  white:        '#FFFFFF',
  onPrimary:    '#FFFFFF',
  card:         '#221B15',
  cardMuted:    '#2C231C',
  border:       '#382D24',
  text:         '#F3EDE7',
  textMuted:    '#B3A69B',
  textLight:    '#7E736A',
  heart:        '#F0616B',
  success:      '#41B876',
  danger:       '#F0616B',
  overlay:      'rgba(0,0,0,0.55)',
};
