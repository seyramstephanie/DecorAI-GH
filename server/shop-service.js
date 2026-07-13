// Shop & Sourcing Service (:4002) — directory, stock, radius matching (FR-15..FR-19).
const { service, store, id, haversineKm } = require('./lib');

// Seeded verified Ghanaian decor shops. Client default location: Kumasi (6.6885, -1.6244).
const SHOP_SEED = [
  { id: 's1', name: 'Adum Blooms & Events', category: 'Florist', area: 'Adum', location: 'Kumasi',
    lat: 6.6906, lng: -1.6280, rating: 4.8, reviews: 124, phone: '+233 24 111 2233', verified: true, radiusKm: 10,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80',
    stock: ['fresh flowers', 'floral arch', 'centrepieces', 'flower stands', 'wreaths', 'potted plant'] },
  { id: 's2', name: 'Kejetia Fabrics & Drapes', category: 'Fabric Supplier', area: 'Kejetia', location: 'Kumasi',
    lat: 6.6970, lng: -1.6178, rating: 4.6, reviews: 89, phone: '+233 20 445 6677', verified: true, radiusKm: 15,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    stock: ['drapes', 'kente runners', 'chair covers', 'table cloths', 'backdrop fabric', 'wall art', 'frames'] },
  { id: 's3', name: 'Ahodwo Home & Furniture', category: 'Furniture', area: 'Ahodwo', location: 'Kumasi',
    lat: 6.6670, lng: -1.6300, rating: 4.7, reviews: 203, phone: '+233 54 889 0011', verified: true, radiusKm: 12,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    stock: ['sofa', 'armchair', 'cushions', 'coffee table', 'side table', 'rug'] },
  { id: 's4', name: 'Bantama Lights & Sound', category: 'Lighting Rental', area: 'Bantama', location: 'Kumasi',
    lat: 6.7050, lng: -1.6350, rating: 4.5, reviews: 67, phone: '+233 26 223 4455', verified: true, radiusKm: 20,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: ['string lights', 'uplighting', 'fairy lights', 'floor lamp', 'chandeliers', 'stage lighting'] },
  { id: 's5', name: 'Osu Decor Mart', category: 'General Decor', area: 'Osu', location: 'Accra',
    lat: 5.5560, lng: -0.1750, rating: 4.9, reviews: 311, phone: '+233 30 990 8877', verified: true, radiusKm: 18,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    stock: ['balloons', 'balloon arch', 'desk', 'bed frame', 'marble table', 'vases', 'candles', 'frames'] },
  { id: 's6', name: 'Tamale Events Supply', category: 'Event Rentals', area: 'Central', location: 'Tamale',
    lat: 9.4008, lng: -0.8393, rating: 4.4, reviews: 42, phone: '+233 24 667 7889', verified: true, radiusKm: 25,
    image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80',
    stock: ['canopy', 'plastic chairs', 'stage skirting', 'drapes', 'balloon columns'] },
  { id: 's7', name: 'East Legon Interiors', category: 'Furniture', area: 'East Legon', location: 'Accra',
    lat: 5.6360, lng: -0.1620, rating: 4.8, reviews: 156, phone: '+233 55 301 2244', verified: true, radiusKm: 15,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    stock: ['sofa', 'accent chair', 'bookshelf', 'rug', 'floor lamp', 'wall art', 'mirrors'] },
  { id: 's8', name: 'Kumasi Craft Village', category: 'Handicrafts', area: 'Ash Town', location: 'Kumasi',
    lat: 6.7000, lng: -1.6100, rating: 4.7, reviews: 98, phone: '+233 24 909 5566', verified: true, radiusKm: 12,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    stock: ['woven baskets', 'clay pots', 'wood carvings', 'beads', 'kente cloth', 'woven mats'] },
  { id: 's9', name: 'Takoradi Beach Decor', category: 'General Decor', area: 'Beach Road', location: 'Takoradi',
    lat: 4.8967, lng: -1.7554, rating: 4.5, reviews: 61, phone: '+233 26 411 7788', verified: true, radiusKm: 20,
    image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=800&q=80',
    stock: ['lanterns', 'vases', 'candles', 'side table', 'cushions', 'string lights'] },
  { id: 's10', name: 'Cape Coast Canopies', category: 'Event Rentals', area: 'Kotokuraba', location: 'Cape Coast',
    lat: 5.1053, lng: -1.2466, rating: 4.6, reviews: 74, phone: '+233 20 655 3311', verified: true, radiusKm: 30,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    stock: ['canopy', 'chairs', 'stage', 'drapes', 'red carpet', 'balloon arch'] },
];
const shops = store('shops', SHOP_SEED);
// Older data files predate images / the newer shops — refresh them once.
if (shops.all().some((s) => !s.image) || shops.all().length < SHOP_SEED.length) shops.save(SHOP_SEED);

const reviews = store('shop-reviews', [
  { id: 'r1', shopId: 's1', author: 'Abena K.', rating: 5, text: 'Beautiful fresh flowers for my mum\'s birthday — delivered same day.', at: '2026-06-20T10:00:00.000Z' },
  { id: 'r2', shopId: 's1', author: 'Kojo M.', rating: 4, text: 'Great arch rental, slightly late setup but gorgeous.', at: '2026-06-28T14:30:00.000Z' },
  { id: 'r3', shopId: 's3', author: 'Efua T.', rating: 5, text: 'Solid furniture, fair prices. The velvet armchair is stunning.', at: '2026-07-01T09:15:00.000Z' },
  { id: 'r4', shopId: 's5', author: 'Yaw B.', rating: 5, text: 'Everything for our office party in one stop.', at: '2026-07-03T16:45:00.000Z' },
  { id: 'r5', shopId: 's7', author: 'Nana A.', rating: 4, text: 'Classy pieces, East Legon prices though!', at: '2026-07-05T11:20:00.000Z' },
]);
if (reviews.all().length === 0) { /* seeded above on first run */ }

const CLIENT_DEFAULT = { lat: 6.6885, lng: -1.6244 }; // Kumasi centre

const withDistance = (shop, lat, lng) => ({
  ...shop,
  distanceKm: Math.round(haversineKm(lat, lng, shop.lat, shop.lng) * 10) / 10,
});

service('shop-service', 4002, {
  // FR-19 — searchable directory
  'GET /shops': (_b, { query }) => {
    const lat = Number(query.lat) || CLIENT_DEFAULT.lat;
    const lng = Number(query.lng) || CLIENT_DEFAULT.lng;
    let rows = shops.all().filter((s) => s.verified).map((s) => withDistance(s, lat, lng));
    if (query.q) {
      const q = query.q.toLowerCase();
      rows = rows.filter((s) =>
        s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) ||
        s.stock.some((item) => item.includes(q)));
    }
    return rows.sort((a, b) => a.distanceKm - b.distanceKm);
  },
  'GET /shops/:id': (_b, { params, query }) => {
    const s = shops.all().find((x) => x.id === params.id);
    return s && withDistance(s, Number(query.lat) || CLIENT_DEFAULT.lat, Number(query.lng) || CLIENT_DEFAULT.lng);
  },
  // FR-15 — match AI-identified items to local shops
  'POST /shops/match': (body) => {
    const lat = body.lat || CLIENT_DEFAULT.lat, lng = body.lng || CLIENT_DEFAULT.lng;
    const items = (body.items || []).map((i) => i.toLowerCase());
    return shops.all()
      .map((s) => {
        const matched = items.filter((item) =>
          s.stock.some((st) => st.includes(item) || item.includes(st) ||
            item.split(' ').some((w) => w.length > 3 && st.includes(w))));
        return { ...withDistance(s, lat, lng), matchedItems: matched };
      })
      .filter((s) => s.matchedItems.length > 0)
      .sort((a, b) => b.matchedItems.length - a.matchedItems.length || a.distanceKm - b.distanceKm);
  },
  // FR-16/17 — online sourcing alternatives + how-to-source guidance (curated, dev-grade)
  'POST /shops/online-sources': (body) => (body.items || []).map((item) => ({
    item,
    sources: [
      { vendor: 'Jumia Ghana', url: `https://www.jumia.com.gh/catalog/?q=${encodeURIComponent(item)}`, delivery: '2–5 days' },
      { vendor: 'Amazon', url: `https://www.amazon.com/s?k=${encodeURIComponent(item)}`, delivery: '10–21 days (import)' },
    ],
    guidance: `If unavailable locally, ask a Kejetia or Makola market vendor to source "${item}", or consider a DIY version using local materials.`,
  })),
  // FR-18 — shop owner sets catchment radius
  'PATCH /shops/:id/radius': (body, { params }) => shops.update(params.id, { radiusKm: body.radiusKm }),
  // internal: shops whose radius covers a client location and whose stock matches items
  'POST /shops/radius-match': (body) => {
    const { lat = CLIENT_DEFAULT.lat, lng = CLIENT_DEFAULT.lng, items = [] } = body;
    const lowered = items.map((i) => i.toLowerCase());
    return shops.all().filter((s) => {
      const dist = haversineKm(lat, lng, s.lat, s.lng);
      const stocked = lowered.some((item) =>
        s.stock.some((st) => st.includes(item) || item.includes(st)));
      return dist <= s.radiusKm && stocked;
    });
  },
  'GET /shops/:id/reviews': (_b, { params }) => reviews.all().filter((r) => r.shopId === params.id),
  'POST /shops/:id/reviews': (body, { params }) =>
    reviews.add({ id: id(), shopId: params.id, ...body, at: new Date().toISOString() }),
});
