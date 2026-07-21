// AI decoration — Java gateway → OpenRouter → Gemini image models.
// Not a chatbot client. OPENROUTER_API_KEY lives on the Java API only.
import { API_BASE } from './api';

export type RoomAnalysis = {
  roomType: string;
  structures: string[];
  placementZones: string[];
  lighting: string;
  existingPalette: string[];
  cameraNotes?: string;
  constraints?: string[];
};

export type GenerationResult = {
  imageBase64: string;
  items: string[];
  analysis: RoomAnalysis;
  attempts: number;
  stages?: string[];
  warning?: string;
  imageModel?: string;
};

export type AiErrorLog = {
  timestamp: string;
  status?: number;
  stage?: string;
  message: string;
  path?: string;
  apiBase: string;
  detail?: string;
};

/** Progress for the result screen loader (0–100, not exact wall-clock). */
export type DecorateProgress = {
  percent: number;
  stage: string;
  attempt?: number;
  maxAttempts?: number;
};

type DecorateResponse = {
  ok?: boolean;
  mock?: boolean;
  message?: string;
  error?: string;
  stage?: string;
  status?: number;
  imageBase64?: string | null;
  items?: string[];
  analysis?: RoomAnalysis;
  attempts?: number;
  stages?: string[];
  warning?: string;
  imageModel?: string;
  path?: string;
  timestamp?: string;
  hint?: string;
};

const CLIENT_MAX_ATTEMPTS = 3;

function parseErrorBody(text: string, httpStatus: number): AiErrorLog {
  let data: DecorateResponse = {};
  try {
    data = text ? (JSON.parse(text) as DecorateResponse) : {};
  } catch {
    /* raw */
  }

  let message =
    data.message ||
    data.error ||
    text.slice(0, 280) ||
    `AI decorate HTTP ${httpStatus}`;

  if (
    !data.message &&
    (message === 'Bad Gateway' || message === 'Internal Server Error' || message === data.error)
  ) {
    const snippet = text && text !== message ? text.slice(0, 200) : '';
    message = `AI decorate failed (HTTP ${data.status ?? httpStatus})${snippet ? `: ${snippet}` : ''}. Check API window for [ai] logs.`;
  }

  return {
    timestamp: data.timestamp || new Date().toISOString(),
    status: data.status ?? httpStatus,
    stage: data.stage,
    message,
    path: data.path || '/ai/decorate',
    apiBase: API_BASE,
    detail: data.hint || `API ${API_BASE}/ai/status · OpenRouter credits required`,
  };
}

export function formatAiErrorForShare(log: AiErrorLog): string {
  return [
    'DecorAI GH — AI decorate error log',
    `Time: ${log.timestamp}`,
    `API: ${log.apiBase}${log.path || ''}`,
    log.status != null ? `HTTP: ${log.status}` : null,
    log.stage ? `Stage: ${log.stage}` : null,
    `Message: ${log.message}`,
    log.detail ? `Hint: ${log.detail}` : null,
    '',
    'Expected: OPENROUTER_API_KEY + GEMINI_IMAGE_MODEL=google/gemini-2.5-flash-image',
    'Check: GET /ai/status · credits at https://openrouter.ai/settings/credits',
  ]
    .filter(Boolean)
    .join('\n');
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryable(err: Error & { aiLog?: AiErrorLog }): boolean {
  const msg = (err.message || '').toLowerCase();
  const status = err.aiLog?.status;
  if (status === 429 || status === 502 || status === 503 || status === 504) return true;
  if (status === 401 || status === 403 || status === 402) return false; // credits / auth — don't loop
  if (msg.includes('no image') || msg.includes('did not return a design')) return true;
  if (msg.includes('returned no image')) return true;
  if (msg.includes('bad gateway')) return true;
  if (msg.includes('timeout') || msg.includes('network')) return true;
  if (msg.includes('cannot reach ai')) return true;
  return false;
}

/**
 * Smooth progress ticker: climbs toward a soft ceiling while work is in flight.
 * Not real ETA — feels consistent so users never stare at a frozen spinner.
 */
function createProgressDriver(
  onProgress?: (p: DecorateProgress) => void,
  attempt = 1,
  maxAttempts = CLIENT_MAX_ATTEMPTS,
) {
  let percent = Math.min(6, 2 + attempt);
  let stage = 'Starting…';
  let ceiling = 12;
  let stopped = false;

  const emit = () => {
    if (stopped) return;
    onProgress?.({
      percent: Math.max(0, Math.min(99, Math.round(percent))),
      stage,
      attempt,
      maxAttempts,
    });
  };

  const timer = setInterval(() => {
    if (stopped) return;
    // Ease toward ceiling; slower as we get closer
    const gap = ceiling - percent;
    if (gap > 0.15) {
      percent += Math.max(0.25, gap * 0.07);
    }
    // Tiny idle drift so bar never looks frozen near the ceiling
    else if (percent < ceiling) {
      percent = Math.min(ceiling, percent + 0.08);
    }
    emit();
  }, 280);

  return {
    setStage(next: string, nextCeiling?: number) {
      stage = next;
      if (typeof nextCeiling === 'number') {
        ceiling = Math.max(ceiling, Math.min(96, nextCeiling));
      }
      emit();
    },
    /** Bump ceiling when we learn more (e.g. retry). */
    raiseCeiling(next: number) {
      ceiling = Math.max(ceiling, Math.min(96, next));
      emit();
    },
    complete() {
      stopped = true;
      clearInterval(timer);
      percent = 100;
      stage = 'Design ready';
      onProgress?.({ percent: 100, stage, attempt, maxAttempts });
    },
    stop() {
      stopped = true;
      clearInterval(timer);
    },
  };
}

async function decorateOnce(
  photoBase64: string,
  mime: string,
  eventType: string,
  style: string,
  vision: string,
  progress: ReturnType<typeof createProgressDriver>,
): Promise<GenerationResult> {
  progress.setStage('Contacting decorate service…', 18);
  progress.setStage('Analysing space & building design brief…', 38);

  let res: Response;
  try {
    // Overlap network with mid-progress targets
    progress.setStage('Sending room photo to image model…', 52);
    const fetchPromise = fetch(`${API_BASE}/ai/decorate`, {
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

    // After a few seconds, advance into "generating" band if still waiting
    const bump = setTimeout(() => {
      progress.setStage('Generating decorated space…', 72);
    }, 2500);
    const bump2 = setTimeout(() => {
      progress.setStage('Rendering photoreal design…', 86);
    }, 9000);
    const bump3 = setTimeout(() => {
      progress.setStage('Almost there — finishing details…', 93);
    }, 22000);

    try {
      res = await fetchPromise;
    } finally {
      clearTimeout(bump);
      clearTimeout(bump2);
      clearTimeout(bump3);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const log: AiErrorLog = {
      timestamp: new Date().toISOString(),
      message: `Cannot reach AI service at ${API_BASE}. Start the API (npm run server). ${msg}`,
      apiBase: API_BASE,
      path: '/ai/decorate',
    };
    const err = new Error(log.message) as Error & { aiLog?: AiErrorLog };
    err.aiLog = log;
    throw err;
  }

  progress.setStage('Receiving design…', 94);

  const text = await res.text();
  let data: DecorateResponse;
  try {
    data = text ? (JSON.parse(text) as DecorateResponse) : {};
  } catch {
    const log = parseErrorBody(text, res.status);
    const err = new Error(log.message) as Error & { aiLog?: AiErrorLog };
    err.aiLog = log;
    throw err;
  }

  if (!res.ok) {
    const log = parseErrorBody(text, res.status);
    const err = new Error(log.message) as Error & { aiLog?: AiErrorLog };
    err.aiLog = log;
    throw err;
  }

  if (data.mock || !data.imageBase64) {
    const log: AiErrorLog = {
      timestamp: new Date().toISOString(),
      message:
        data.message ||
        'AI returned no design image. Retrying may help, or check OPENROUTER_API_KEY credits.',
      apiBase: API_BASE,
      path: '/ai/decorate',
      stage: data.mock ? 'config' : 'generate',
      status: data.mock ? 503 : 502,
    };
    const err = new Error(log.message) as Error & { aiLog?: AiErrorLog };
    err.aiLog = log;
    throw err;
  }

  if (data.stages?.length) {
    progress.setStage(data.stages[data.stages.length - 1], 97);
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
    imageModel: data.imageModel,
  };
}

/**
 * Full pipeline via POST /ai/decorate.
 * Retries when the model returns no image / transient gateway errors.
 * Progress is a consistent 0–100 feel, not a precise ETA.
 */
export async function generateDecoration(
  photoB64: string,
  eventType: string,
  style: string,
  vision: string,
  onProgress?: (p: DecorateProgress | string) => void,
): Promise<GenerationResult> {
  // Back-compat: allow old string-only callbacks
  const emit = (p: DecorateProgress) => {
    if (!onProgress) return;
    try {
      onProgress(p);
    } catch {
      /* ignore */
    }
  };

  let photoBase64 = photoB64;
  let mime = 'image/jpeg';
  if (photoBase64.includes(',')) {
    const head = photoBase64.slice(0, photoBase64.indexOf(','));
    if (head.includes('image/png')) mime = 'image/png';
    if (head.includes('image/webp')) mime = 'image/webp';
    photoBase64 = photoBase64.slice(photoBase64.indexOf(',') + 1);
  }

  let lastError: (Error & { aiLog?: AiErrorLog }) | null = null;

  for (let attempt = 1; attempt <= CLIENT_MAX_ATTEMPTS; attempt++) {
    const progress = createProgressDriver(emit, attempt, CLIENT_MAX_ATTEMPTS);
    if (attempt > 1) {
      progress.setStage(
        `No image yet — retrying (${attempt}/${CLIENT_MAX_ATTEMPTS})…`,
        15 + attempt * 5,
      );
      await sleep(700 * attempt);
    }

    try {
      const result = await decorateOnce(
        photoBase64,
        mime,
        eventType,
        style,
        vision,
        progress,
      );
      progress.complete();
      return result;
    } catch (e) {
      progress.stop();
      const err = e as Error & { aiLog?: AiErrorLog };
      lastError = err;
      if (attempt < CLIENT_MAX_ATTEMPTS && isRetryable(err)) {
        emit({
          percent: Math.min(40, 8 + attempt * 8),
          stage: `Model returned no image — retrying (${attempt}/${CLIENT_MAX_ATTEMPTS})…`,
          attempt,
          maxAttempts: CLIENT_MAX_ATTEMPTS,
        });
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error('Decoration failed after retries');
}

/** Optional: check AI service without generating. */
export async function aiServiceStatus(): Promise<{
  configured: boolean;
  message?: string;
  imageModel?: string;
  billing?: unknown;
  provider?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/ai/status`);
    const data = (await res.json()) as {
      configured?: boolean;
      message?: string;
      imageModel?: string;
      billing?: unknown;
      provider?: string;
    };
    return {
      configured: Boolean(data.configured),
      message: data.message,
      imageModel: data.imageModel,
      billing: data.billing,
      provider: data.provider,
    };
  } catch {
    return { configured: false, message: `API offline at ${API_BASE}` };
  }
}
