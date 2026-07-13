// Decorator Service (:4003) — directory, briefs, bookings, in-app messaging (FR-20..FR-25).
const { service, store, id } = require('./lib');

const DECORATOR_SEED = [
  { id: 'd1', name: 'Akosua Mensah', businessName: 'Royal Touch Decor', location: 'Kumasi',
    lat: 6.6931, lng: -1.6244, // Adum, Kumasi
    rating: 4.9, reviews: 87, specialisations: ['Wedding', 'Church Anniversary'], priceRange: 'GH₵2,000–8,000',
    verified: true, phone: '+233 24 555 1122',
    bio: 'Award-winning wedding and church decorator serving Ashanti Region for 8 years.',
    portfolio: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
    ] },
  { id: 'd2', name: 'Kofi Asante', businessName: 'Asante Events GH', location: 'Accra',
    lat: 5.6037, lng: -0.1870, // Accra central
    rating: 4.7, reviews: 132, specialisations: ['Corporate', 'Birthday'], priceRange: 'GH₵1,500–6,000',
    verified: true, phone: '+233 20 777 3344',
    bio: 'Corporate launches, birthdays and premium private events across Greater Accra.',
    portfolio: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    ] },
  { id: 'd3', name: 'Efua Boateng', businessName: 'Serene Spaces', location: 'Kumasi',
    lat: 6.7085, lng: -1.6305, // Ahodwo, Kumasi
    rating: 4.8, reviews: 54, specialisations: ['Home Interior', 'Luxury'], priceRange: 'GH₵3,000–15,000',
    verified: true, phone: '+233 54 222 9900',
    bio: 'Interior styling for homes and offices — modern Ghanaian contemporary is my signature.',
    portfolio: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
    ] },
  { id: 'd4', name: 'Randa Wuni', businessName: 'Northern Elegance', location: 'Tamale',
    lat: 9.4008, lng: -0.8393, // Tamale central
    rating: 4.6, reviews: 29, specialisations: ['Funeral', 'Traditional', 'Wedding'], priceRange: 'GH₵1,000–5,000',
    verified: true, phone: '+233 26 888 4455',
    bio: 'Traditional and modern event decoration across the Northern Region.',
    portfolio: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80',
    ] },
  { id: 'd5', name: 'Ama Owusu', businessName: 'Golden Gates Events', location: 'Accra',
    lat: 5.6500, lng: -0.2000, // Achimota
    rating: 4.9, reviews: 210, specialisations: ['Wedding', 'Luxury', 'Corporate'], priceRange: 'GH₵5,000–25,000',
    verified: true, phone: '+233 24 300 7788',
    bio: 'Premium weddings and galas — full venue transformation with in-house florals and lighting.',
    portfolio: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    ] },
  { id: 'd6', name: 'Yaw Darko', businessName: 'Darko Decor Works', location: 'Takoradi',
    lat: 4.9016, lng: -1.7830, // Takoradi
    rating: 4.5, reviews: 47, specialisations: ['Birthday', 'Corporate', 'Home Interior'], priceRange: 'GH₵800–4,000',
    verified: true, phone: '+233 55 612 9900',
    bio: 'Western Region parties, office launches and cosy home makeovers on any budget.',
    portfolio: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
    ] },
  { id: 'd7', name: 'Esi Cudjoe', businessName: 'Coastal Blooms', location: 'Cape Coast',
    lat: 5.1315, lng: -1.2795, // Cape Coast
    rating: 4.7, reviews: 63, specialisations: ['Funeral', 'Church Anniversary', 'Traditional'], priceRange: 'GH₵1,200–6,000',
    verified: true, phone: '+233 20 218 4455',
    bio: 'Dignified funerals and church celebrations along the coast, with traditional touches.',
    portfolio: [
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    ] },
];
const decorators = store('decorators', DECORATOR_SEED);
// Older data files predate lat/lng and the newer entries — refresh them once.
if (decorators.all().some((d) => d.lat === undefined) || decorators.all().length < DECORATOR_SEED.length)
  decorators.save(DECORATOR_SEED);
const BOOKING_SEED = [
  { id: 'b1', decoratorId: 'd1', decoratorName: 'Royal Touch Decor', clientId: 'u1', clientName: 'Seyram Dede',
    eventType: 'Wedding', eventDate: '24 Dec 2026', venue: 'Miklin Hotel, Kumasi', budget: '6000',
    brief: '[AI design attached] White & gold theme with floral arch and kente runners.',
    designImage: 'attached-ai-design', status: 'Confirmed', createdAt: '2026-07-01T10:00:00.000Z' },
  { id: 'b2', decoratorId: 'd3', decoratorName: 'Serene Spaces', clientId: 'u1', clientName: 'Seyram Dede',
    eventType: 'Home Interior', eventDate: '15 Aug 2026', venue: 'Ahodwo, Kumasi', budget: '4500',
    brief: 'Living room refresh — modern Ghanaian contemporary style.',
    status: 'Enquiry', createdAt: '2026-07-08T15:30:00.000Z' },
];
const bookings = store('bookings', BOOKING_SEED);
if (bookings.all().length === 0) bookings.save(BOOKING_SEED); // demo data for fresh installs
const messages = store('messages', [
  { id: 'm1', bookingId: 'dm_d1_u1', from: 'u1', fromName: 'Seyram Dede',
    text: 'Hello! I love your portfolio — are you free on 24 Dec?', at: '2026-07-10T09:00:00.000Z' },
  { id: 'm2', bookingId: 'dm_d1_u1', from: 'd1', fromName: 'Akosua Mensah',
    text: 'Hi Seyram! Yes we are — send me your venue and I\'ll draft a quote.', at: '2026-07-10T09:12:00.000Z' },
]);

const STATUSES = ['Enquiry', 'Confirmed', 'In Preparation', 'Completed'];

service('decorator-service', 4003, {
  // FR-20 — filterable directory
  'GET /decorators': (_b, { query }) => {
    let rows = decorators.all().filter((d) => d.verified); // NFR-06: only verified are public
    if (query.location) rows = rows.filter((d) => d.location.toLowerCase() === query.location.toLowerCase());
    if (query.event) rows = rows.filter((d) => d.specialisations.some(
      (s) => s.toLowerCase().includes(query.event.toLowerCase())));
    return rows;
  },
  'GET /decorators/:id': (_b, { params }) => decorators.all().find((d) => d.id === params.id),

  // FR-21/22 — booking request carries the shared AI design as the formal brief
  'POST /bookings': (body) => bookings.add({
    id: id(), status: 'Enquiry', createdAt: new Date().toISOString(),
    decoratorName: decorators.all().find((d) => d.id === body.decoratorId)?.businessName || '',
    ...body,
  }),
  'GET /bookings': (_b, { query }) => {
    let rows = bookings.all();
    if (query.clientId) rows = rows.filter((b) => b.clientId === query.clientId);
    if (query.decoratorId) rows = rows.filter((b) => b.decoratorId === query.decoratorId);
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  // FR-24 — status tracking through the four stages
  'PATCH /bookings/:id/status': (body, { params }) => {
    if (!STATUSES.includes(body.status)) throw Object.assign(new Error('invalid status'), { status: 400 });
    return bookings.update(params.id, { status: body.status });
  },

  // FR-23 — in-app messaging. Threads are either a booking id or a direct-message
  // id of the form dm_<decoratorId>_<clientId>; messages are shared, both ends real.
  'GET /bookings/:id/messages': (_b, { params }) =>
    messages.all().filter((m) => m.bookingId === params.id),
  'POST /bookings/:id/messages': (body, { params }) =>
    messages.add({ id: id(), bookingId: params.id, at: new Date().toISOString(), ...body }),

  // Inbox — every thread the requester participates in, newest first. Decorator
  // accounts are matched to their directory entry by phone number.
  'GET /threads': (_b, { query }) => {
    const uid = query.userId || '';
    const dirId = query.phone
      ? decorators.all().find((d) => d.phone === query.phone)?.id ?? null
      : null;
    const allMessages = messages.all();
    const byThread = new Map();
    for (const m of allMessages) byThread.set(m.bookingId, m); // append order → last message wins

    const out = [];
    for (const [threadId, last] of byThread) {
      const dm = threadId.match(/^dm_([^_]+)_(.+)$/);
      let participant = false, title = 'Chat', decoratorId = null;
      if (dm) {
        decoratorId = dm[1];
        const clientId = dm[2];
        participant = clientId === uid || decoratorId === dirId;
        if (clientId === uid) {
          title = decorators.all().find((d) => d.id === decoratorId)?.businessName ?? 'Decorator';
        } else {
          const fromClient = allMessages.find((m) => m.bookingId === threadId && m.from === clientId);
          title = fromClient?.fromName ?? 'Client';
        }
      } else {
        const b = bookings.all().find((x) => x.id === threadId);
        if (b) {
          decoratorId = b.decoratorId;
          participant = b.clientId === uid || b.decoratorId === dirId;
          title = b.clientId === uid ? b.decoratorName : b.clientName;
        }
      }
      if (participant) out.push({ threadId, title, decoratorId, lastText: last.text, at: last.at });
    }
    return out.sort((a, b) => b.at.localeCompare(a.at));
  },
});
