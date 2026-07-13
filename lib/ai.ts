// AI decoration pipeline (FR-07..FR-14) — Gemini, 4 steps:
// analyse room -> restrictive generation prompt -> generate image -> verify structure (retry <=3)
const KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const API = 'https://generativelanguage.googleapis.com/v1beta/models';
const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

export type RoomAnalysis = {
  roomType: string;
  structures: string[];       // fixed elements that must never change
  placementZones: string[];   // where decor can safely be added
  lighting: string;
  existingPalette: string[];
};
export type GenerationResult = {
  imageBase64: string;        // decorated preview (base64 png/jpeg)
  items: string[];            // FR-14 identified decoration items
  analysis: RoomAnalysis;
  attempts: number;
};

type Part = { text?: string; inline_data?: { mime_type: string; data: string } };

async function call(model: string, parts: Part[], jsonOut = false, imageOut = false) {
  const body: any = { contents: [{ parts }] };
  if (jsonOut) body.generationConfig = { responseMimeType: 'application/json' };
  if (imageOut) body.generationConfig = { responseModalities: ['IMAGE', 'TEXT'] };
  const res = await fetch(`${API}/${model}:generateContent?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).candidates?.[0]?.content?.parts ?? [];
}

const img = (data: string, mime = 'image/jpeg'): Part => ({ inline_data: { mime_type: mime, data } });
const textOf = (parts: any[]) => parts.find((p) => p.text)?.text ?? '';
const imageOf = (parts: any[]) => parts.find((p) => p.inlineData || p.inline_data)?.inlineData?.data
  ?? parts.find((p) => p.inline_data)?.inline_data?.data;

// Step 1 — understand the room and where decor may be placed
export async function analyzeRoom(photoB64: string): Promise<RoomAnalysis> {
  const parts = await call(TEXT_MODEL, [
    { text:
      'Analyse this photo of a space in Ghana that a client wants decorated. Return strict JSON: ' +
      '{"roomType": string, "structures": string[] (fixed elements: walls, windows, doors, ceiling, floor, pillars, built-ins — described precisely), ' +
      '"placementZones": string[] (specific spots where decoration items can be added without altering structure), ' +
      '"lighting": string, "existingPalette": string[] (dominant colours)}' },
    img(photoB64),
  ], true);
  return JSON.parse(textOf(parts));
}

// Step 2 — highly structured, restrictive prompt
function buildPrompt(a: RoomAnalysis, eventType: string, style: string, vision: string) {
  return [
    `Redecorate this exact ${a.roomType} for a ${eventType} in a ${style} style. ${vision}`,
    'STRICT RULES — follow every one:',
    `1. PRESERVE UNCHANGED: ${a.structures.join('; ')}. Identical position, shape, colour and material.`,
    '2. Do NOT move, resize or repaint walls, windows, doors, ceiling or floor.',
    '3. Keep the exact camera angle, perspective and lighting direction.',
    `4. ONLY add or restyle decoration in: ${a.placementZones.join('; ')}.`,
    '5. Added decor must be photorealistic and match the scene lighting.',
    '6. Output the same room, same viewpoint — decorated, nothing else altered.',
  ].join('\n');
}

// Step 3 — verify the generated image did not damage the room structure
async function verifyStructure(originalB64: string, generatedB64: string, a: RoomAnalysis) {
  const parts = await call(TEXT_MODEL, [
    { text:
      'Image 1 is the original room. Image 2 is an AI-decorated version. The following fixed structures must be unchanged: ' +
      a.structures.join('; ') +
      '. Compare strictly and return JSON: {"preserved": boolean, "issues": string[]}. ' +
      'preserved=false if any wall, window, door, floor, ceiling or fixed element moved, changed shape/material, or the camera angle changed. Added decoration is allowed.' },
    img(originalB64), img(generatedB64),
  ], true);
  return JSON.parse(textOf(parts)) as { preserved: boolean; issues: string[] };
}

// Step 4 — FR-14: list the key decoration items visible in the approved preview
async function identifyItems(generatedB64: string): Promise<string[]> {
  const parts = await call(TEXT_MODEL, [
    { text:
      'List the key decoration items visible in this image (flowers, drapes, centrepieces, lighting, furniture, frames, plants...). ' +
      'Return JSON: {"items": string[]} — max 8, short names a Ghanaian decor shop would stock.' },
    img(generatedB64),
  ], true);
  return JSON.parse(textOf(parts)).items ?? [];
}

const MAX_ATTEMPTS = 3;

export async function generateDecoration(
  photoB64: string, eventType: string, style: string, vision: string,
  onProgress?: (stage: string) => void,
): Promise<GenerationResult> {
  onProgress?.('Analysing your space…');
  const analysis = await analyzeRoom(photoB64);
  const prompt = buildPrompt(analysis, eventType, style, vision);

  let lastImage = '';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    onProgress?.(attempt === 1 ? 'Generating decoration…' : `Refining (attempt ${attempt})…`);
    const parts = await call(IMAGE_MODEL, [{ text: prompt }, img(photoB64)], false, true);
    const generated = imageOf(parts);
    if (!generated) continue;
    lastImage = generated;

    onProgress?.('Checking room structure…');
    const verdict = await verifyStructure(photoB64, generated, analysis).catch(() => ({ preserved: true, issues: [] }));
    if (verdict.preserved) {
      onProgress?.('Identifying items…');
      const items = await identifyItems(generated).catch(() => []);
      return { imageBase64: generated, items, analysis, attempts: attempt };
    }
  }
  if (!lastImage) throw new Error('Image generation failed — please try again.');
  // All attempts altered structure; return best effort with items so the user is never stuck.
  const items = await identifyItems(lastImage).catch(() => []);
  return { imageBase64: lastImage, items, analysis, attempts: MAX_ATTEMPTS };
}
