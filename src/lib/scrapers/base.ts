import { createServiceRoleClient } from "@/lib/supabase/server";
import type { BrandId } from "./types";

const CHROME_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Vélez is a lightweight public JSON API meant for exactly this kind of
// traffic (it's what the storefront's own frontend calls on every
// search), not an HTML page being scraped — so a few requests per
// second is normal, not abusive. It's also kept short because the
// product-recommend route has to finish inside Vercel's ~10s serverless
// ceiling; see run-search.ts.
const RATE_LIMIT_MS = Number(process.env.SCRAPER_RATE_LIMIT_MS ?? 400);
const REQUEST_TIMEOUT_MS = 4000;
const MAX_ATTEMPTS = 2;

// Serializes requests per hostname so concurrent queries against the same
// brand never fire faster than RATE_LIMIT_MS apart, even within one
// serverless invocation. Resets on cold start — that's fine, the point is
// courtesy pacing, not a hard global cap.
const lastRequestAt = new Map<string, number>();
let queue: Promise<void> = Promise.resolve();

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRateLimit(hostname: string) {
  const run = async () => {
    const last = lastRequestAt.get(hostname) ?? 0;
    const elapsed = Date.now() - last;
    if (elapsed < RATE_LIMIT_MS) {
      await delay(RATE_LIMIT_MS - elapsed);
    }
    lastRequestAt.set(hostname, Date.now());
  };
  // Chain onto the shared queue so overlapping calls don't race the check.
  const next = queue.then(run, run);
  queue = next;
  await next;
}

/**
 * Fetches JSON from a brand's public endpoint with per-domain rate
 * limiting, a real Chrome UA, a short timeout, and up to
 * MAX_ATTEMPTS tries on transient failures (network errors, 429, 5xx).
 * Never throws — callers get `null` on failure so a single brand's
 * outage can't break the rest of the search.
 */
export async function fetchJsonPolite<T>(
  url: string,
  brand: BrandId,
  init?: RequestInit
): Promise<T | null> {
  const hostname = new URL(url).hostname;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await waitForRateLimit(hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          "User-Agent": CHROME_USER_AGENT,
          Accept: "application/json",
          ...init?.headers,
        },
      });
      clearTimeout(timeout);

      if (res.status === 429 || res.status >= 500) {
        if (attempt < MAX_ATTEMPTS) continue;
        await logScraperError(brand, `HTTP ${res.status}`, url);
        return null;
      }
      if (!res.ok) {
        await logScraperError(brand, `HTTP ${res.status}`, url);
        return null;
      }

      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timeout);
      if (attempt >= MAX_ATTEMPTS) {
        const message = err instanceof Error ? err.message : "Unknown error";
        await logScraperError(brand, message, url);
        return null;
      }
    }
  }

  return null;
}

export async function logScraperError(brand: BrandId, error: string, url: string) {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("scraper_errors").insert({ brand, error, url });
  } catch {
    // Logging must never crash the request.
  }
}

export function parseColombianPrice(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? value : null;
}
