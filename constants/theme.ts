export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const Radii = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };
export const Type = {
  hero: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '700' as const },
  subtitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  price: { fontSize: 14, fontWeight: '700' as const },
};
export const Shadow = {
  card: {
    shadowColor: '#1F1A16', shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  float: {
    shadowColor: '#1F1A16', shadowOpacity: 0.14, shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
};
