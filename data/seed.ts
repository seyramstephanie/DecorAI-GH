// Client-side seed data: home catalogue + Look Studio shop + prompt templates (FR-09).

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  shopId: string;
  /** Extra gallery frames for the immersive product page */
  gallery: string[];
  description: string;
  materials: string[];
  colors: string[];
  dimensions: string;
  inStock: number;
  tag?: string;
};

export type LookbookShop = {
  id: string;
  name: string;
  category: string;
  area: string;
  location: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  phone: string;
  verified: boolean;
  radiusKm: number;
  image: string;
  cover: string;
  bio: string;
  hours: string;
  stock: string[];
  productIds: string[];
};

// Product photos matching the UI reference items (sofa, floor lamp, plant, desk, …)
export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Mattress 2 Seater Sofa',
    price: 1359,
    category: 'Sofa',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80',
    shopId: 'lookbook',
    gallery: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=80',
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=900&q=80',
    ],
    description:
      'Deep-seat two-seater sofa with plush upholstery — built for Ghanaian living rooms that host. Soft bounce, removable covers, and a frame that survives weekend visitors.',
    materials: ['Kiln-dried hardwood', 'High-density foam', 'Performance fabric'],
    colors: ['Warm sand', 'Charcoal', 'Terracotta'],
    dimensions: '160 × 90 × 85 cm',
    inStock: 6,
    tag: 'Bestseller',
  },
  {
    id: 'p2',
    name: 'Enterprises Wooden Floor Lamp',
    price: 154,
    category: 'Popular',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=80',
    shopId: 'lookbook',
    gallery: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&q=80',
      'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=900&q=80',
    ],
    description:
      'Sculptural timber stem with a linen shade that throws warm pools of light — ideal beside sofas or reading nooks.',
    materials: ['Solid wood', 'Linen shade', 'Brass fittings'],
    colors: ['Natural oak', 'Walnut'],
    dimensions: 'Height 150 cm · Shade Ø 40 cm',
    inStock: 14,
    tag: 'Lighting',
  },
  {
    id: 'p3',
    name: 'Garden Art Natural Looking Plant',
    price: 470,
    category: 'Popular',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=900&q=80',
    shopId: 'lookbook',
    gallery: [
      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=900&q=80',
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&q=80',
      'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=900&q=80',
    ],
    description:
      'Ultra-real botanical for corners that need life without the watering schedule. Potted in a ceramic vessel ready for Accra heat.',
    materials: ['UV-stable foliage', 'Ceramic pot', 'Weighted base'],
    colors: ['Forest green', 'Sage pot'],
    dimensions: 'Height 120 cm',
    inStock: 9,
    tag: 'Greenery',
  },
  {
    id: 'p4',
    name: 'Generic Multipurpose Desk',
    price: 165,
    category: 'Table',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=80',
    shopId: 'lookbook',
    gallery: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=80',
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=900&q=80',
      'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=900&q=80',
    ],
    description:
      'Compact multipurpose desk for study nooks and content setups. Cable cut-out, matte top, and tapered legs that read modern-Ghanaian.',
    materials: ['Engineered wood', 'Powder-coated steel'],
    colors: ['White oak', 'Matte black'],
    dimensions: '120 × 60 × 75 cm',
    inStock: 11,
  },
  {
    id: 'p5',
    name: 'Velvet Accent Armchair',
    price: 890,
    category: 'Chair',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=80',
    shopId: 'lookbook',
    gallery: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=900&q=80',
    ],
    description:
      'Statement velvet armchair with a curved back — the piece guests photograph first. Dense foam, silent swivel optional.',
    materials: ['Cotton velvet', 'Hardwood frame', 'Sinous springs'],
    colors: ['Burnt sienna', 'Ink blue', 'Ivory'],
    dimensions: '78 × 82 × 90 cm',
    inStock: 4,
    tag: 'Statement',
  },
  {
    id: 'p6',
    name: 'Abstract Framed Wall Art',
    price: 220,
    category: 'Popular',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80',
    shopId: 'lookbook',
    gallery: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=80',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=80',
    ],
    description:
      'Gallery-scale abstract print in a floating wood frame. Warm pigments that pair with terracotta interiors.',
    materials: ['Archival giclée', 'Oak frame', 'Museum glass'],
    colors: ['Ochre', 'Clay', 'Ink'],
    dimensions: '80 × 100 cm',
    inStock: 18,
  },
  {
    id: 'p7',
    name: 'Rattan King Bed Frame',
    price: 2150,
    category: 'Bed',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=900&q=80',
    shopId: 'lookbook',
    gallery: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=900&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&q=80',
    ],
    description:
      'Hand-woven rattan king frame with a woven headboard that filters morning light. Coastal-meets-Kumasi craftsmanship.',
    materials: ['Natural rattan', 'Solid timber rails', 'Cotton webbing'],
    colors: ['Honey rattan', 'Bleached cane'],
    dimensions: 'King 200 × 180 cm',
    inStock: 3,
    tag: 'Handcrafted',
  },
  {
    id: 'p8',
    name: 'Round Marble Side Table',
    price: 340,
    category: 'Table',
    image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=900&q=80',
    shopId: 'lookbook',
    gallery: [
      'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=900&q=80',
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=900&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80',
    ],
    description:
      'Compact marble-top side table on a sculpted base — holds lamps, ampetesi, and the remote without clutter.',
    materials: ['Marble composite', 'Powder-coated metal'],
    colors: ['Carrara white', 'Verde green'],
    dimensions: 'Ø 45 × H 50 cm',
    inStock: 12,
  },
];

/** Flagship shop that stocks every “Shop the look” piece. */
export const LOOKBOOK_SHOP: LookbookShop = {
  id: 'lookbook',
  name: 'DecorAI Look Studio',
  category: 'Furniture',
  area: 'Airport Residential',
  location: 'Accra',
  lat: 5.6037,
  lng: -0.1870,
  rating: 4.9,
  reviews: 286,
  phone: '+233 30 274 8800',
  verified: true,
  radiusKm: 25,
  image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80',
  cover: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80',
  bio:
    'The official DecorAI lookbook floor — every piece from Shop the look, styled in room vignettes you can buy, book delivery for, or match with a decorator.',
  hours: 'Mon–Sat 9:00–19:00 · Sun 11:00–17:00',
  stock: PRODUCTS.map((p) => p.name.toLowerCase()),
  productIds: PRODUCTS.map((p) => p.id),
};

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const getShopProducts = (shopId: string) =>
  shopId === LOOKBOOK_SHOP.id
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.shopId === shopId);

export const CATEGORIES = ['Popular', 'Sofa', 'Chair', 'Table', 'Bed'] as const;

export const EVENT_TYPES = ['Wedding', 'Funeral', 'Birthday', 'Church Anniversary', 'Corporate', 'Home Interior'];
export const STYLES = ['Modern', 'Traditional', 'Rustic', 'Luxury'];

// FR-09 — prompt template library organised by event type
export const PROMPT_TEMPLATES: Record<string, string[]> = {
  Wedding: [
    'Elegant white and gold drapes along the walls, a floral arch at the focal point, round tables with kente table runners and centrepieces.',
    'Romantic blush and ivory theme with fairy lights, tall flower stands and a sweetheart table backdrop.',
  ],
  Funeral: [
    'Dignified black, white and red decoration with draped fabric, seat covers, a framed portrait stand and white flower arrangements.',
    'Traditional Akan funeral setting with red and black drapes, canopy dressing and floral wreaths.',
  ],
  Birthday: [
    'Bright balloon garlands, a dessert table backdrop and warm string lighting.',
    'Chic pastel theme with a balloon arch, cake pedestal and photo corner.',
  ],
  'Church Anniversary': [
    'Purple and gold sanctuary decoration with pulpit drapes, aisle flowers and banner backdrop.',
    'White and royal blue theme with balloon columns and stage skirting.',
  ],
  Corporate: [
    'Clean branded stage backdrop, uplighting and dressed cocktail tables.',
    'Minimal luxury: black and gold accents, lounge corners and podium florals.',
  ],
  'Home Interior': [
    'Warm modern living room: neutral sofa, wooden accents, potted plants and framed wall art.',
    'Cosy Ghanaian contemporary style: woven baskets, earth-tone textiles and a statement floor lamp.',
  ],
};
