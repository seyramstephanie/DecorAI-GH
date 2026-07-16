// Client-side seed data: home catalogue (mirrors the UI reference) + prompt template library (FR-09).
export type Product = {
  id: string; name: string; price: number; category: string; image: string; shopId: string;
};

// Product photos matching the UI reference items (sofa, floor lamp, plant, desk, …)
export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Mattress 2 Seater Sofa', price: 1359, category: 'Sofa',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', shopId: 's3' },
  { id: 'p2', name: 'Enterprises Wooden Floor Lamp', price: 154, category: 'Popular',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80', shopId: 's4' },
  { id: 'p3', name: 'Garden Art Natural Looking Plant', price: 470, category: 'Popular',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80', shopId: 's1' },
  { id: 'p4', name: 'Generic Multipurpose Desk', price: 165, category: 'Table',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80', shopId: 's5' },
  { id: 'p5', name: 'Velvet Accent Armchair', price: 890, category: 'Chair',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', shopId: 's3' },
  { id: 'p6', name: 'Abstract Framed Wall Art', price: 220, category: 'Popular',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', shopId: 's2' },
  // Previous Unsplash id 404'd; use a stable bed photo
  { id: 'p7', name: 'Rattan King Bed Frame', price: 2150, category: 'Bed',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80', shopId: 's5' },
  { id: 'p8', name: 'Round Marble Side Table', price: 340, category: 'Table',
    image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=600&q=80', shopId: 's5' },
];

export const CATEGORIES = ['Popular', 'Sofa', 'Chair', 'Table', 'Bed'] as const;

export const EVENT_TYPES = ['Wedding', 'Funeral', 'Birthday', 'Church Anniversary', 'Corporate', 'Home Interior'];
export const STYLES = ['Modern', 'Traditional', 'Rustic', 'Luxury'];

// FR-09 — prompt template library organised by event type
export const PROMPT_TEMPLATES: Record<string, string[]> = {
  'Wedding': [
    'Elegant white and gold drapes along the walls, a floral arch at the focal point, round tables with kente table runners and centrepieces.',
    'Romantic blush and ivory theme with fairy lights, tall flower stands and a sweetheart table backdrop.',
  ],
  'Funeral': [
    'Dignified black, white and red decoration with draped fabric, seat covers, a framed portrait stand and white flower arrangements.',
    'Traditional Akan funeral setting with red and black drapes, canopy dressing and floral wreaths.',
  ],
  'Birthday': [
    'Bright balloon garlands, a dessert table backdrop and warm string lighting.',
    'Chic pastel theme with a balloon arch, cake pedestal and photo corner.',
  ],
  'Church Anniversary': [
    'Purple and gold sanctuary decoration with pulpit drapes, aisle flowers and banner backdrop.',
    'White and royal blue theme with balloon columns and stage skirting.',
  ],
  'Corporate': [
    'Clean branded stage backdrop, uplighting and dressed cocktail tables.',
    'Minimal luxury: black and gold accents, lounge corners and podium florals.',
  ],
  'Home Interior': [
    'Warm modern living room: neutral sofa, wooden accents, potted plants and framed wall art.',
    'Cosy Ghanaian contemporary style: woven baskets, earth-tone textiles and a statement floor lamp.',
  ],
};
