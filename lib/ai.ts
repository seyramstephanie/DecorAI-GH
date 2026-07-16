// AI decoration pipeline — calls ai-decorate-service on the Java gateway.
// When GEMINI_API_KEY is set on the API, photo → finished designed space.
// Client no longer needs the Gemini key in Expo (optional local fallback kept).
import { API_BASE } from './api';

export type RoomAnalysis = {
  roomType: string;
  structures: string[];
  placementZones: string[];
  lighting: string;
  existingPalette: string[];
  cameraNotes?: string;
};

export type GenerationResult = {
  imageBase64: string;
  items: string[];
  analysis: RoomAnalysis;
  attempts: number;
  stages?: string[];
  warning?: string;
};

type DecorateResponse = {
  ok?: boolean;
  mock?: boolean;
  message?: string;
  imageBase64?: string | null;
  items?: string[];
  analysis?: RoomAnalysis;
  attempts?: number;
  stages?: string[];
  warning?: string;
};

/**
 * Full pipeline via POST /ai/decorate (microservices gateway).
 * Progress stages are returned after completion; we surface intermediate labels client-side.
 */
export async function generateDecoration(
  photoB64: string,
  eventType: string,
  style: string,
  vision: string,
  onProgress?: (stage: string) => void,
): Promise<GenerationResult> {
  onProgress?.('Contacting AI decorate service…');

  // Strip data-URL prefix if present
  let photoBase64 = photoB64;
  let mime = 'image/jpeg';
  if (photoBase64.includes(',')) {
    const head = photoBase64.slice(0, photoBase64.indexOf(','));
    if (head.includes('image/png')) mime = 'image/png';
    photoBase64 = photoBase64.slice(photoBase64.indexOf(',') + 1);
  }

  onProgress?.('Analysing space & generating design…');

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/ai/decorate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        photoBase64,
        photoB64: photoBase64,
        eventType,
        style,
        vision,
        mime,
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Cannot reach AI service at ${API_BASE}. Start the API (npm run server). ${msg}`,
    );
  }

  const text = await res.text();
  let data: DecorateResponse;
  try {
    data = text ? (JSON.parse(text) as DecorateResponse) : {};
  } catch {
    throw new Error(`Invalid AI response: ${text.slice(0, 160)}`);
  }

  if (!res.ok) {
    throw new Error(data.message || text.slice(0, 200) || `AI decorate HTTP ${res.status}`);
  }

  if (data.mock || !data.imageBase64) {
    throw new Error(
      data.message ||
        'AI not configured. Add GEMINI_API_KEY to root .env, restart npm run server, then try again.',
    );
  }

  if (data.stages?.length) {
    onProgress?.(data.stages[data.stages.length - 1]);
  } else {
    onProgress?.('Design ready');
  }

  return {
    imageBase64: data.imageBase64,
    items: Array.isArray(data.items) ? data.items : [],
    analysis: data.analysis ?? {
      roomType: 'space',
      structures: [],
      placementZones: [],
      lighting: '',
      existingPalette: [],
    },
    attempts: data.attempts ?? 1,
    stages: data.stages,
    warning: data.warning,
  };
}

/** Optional: check AI service without generating. */
export async function aiServiceStatus(): Promise<{ configured: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/ai/status`);
    const data = (await res.json()) as { configured?: boolean; message?: string };
    return { configured: Boolean(data.configured), message: data.message };
  } catch {
    return { configured: false, message: `API offline at ${API_BASE}` };
  }
}
