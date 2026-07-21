import { velezAdapter } from "./velez";
import { puntoblancoAdapter } from "./puntoblanco";
import { hmAdapter } from "./hm";
import { buildCacheKey, getCachedProducts, setCachedProducts } from "./cache";
import type { BrandAdapter, ScrapedProduct, SearchParams } from "./types";

export type { ScrapedProduct, SearchParams, ProductCategory, BrandId } from "./types";

const ADAPTERS: BrandAdapter[] = [velezAdapter, puntoblancoAdapter, hmAdapter];

// Combining diacritical marks (U+0300–U+036F), stripped after NFD
// normalization so "camisón" and "camison" match the same way.
const DIACRITICS_PATTERN = new RegExp(
  "[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]",
  "g"
);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "");
}

function dedupe(products: ScrapedProduct[]): ScrapedProduct[] {
  const seen = new Set<string>();
  const result: ScrapedProduct[] = [];
  for (const product of products) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    result.push(product);
  }
  return result;
}

function rankByRelevance(products: ScrapedProduct[], query: string): ScrapedProduct[] {
  const queryWords = normalize(query).split(/\s+/).filter(Boolean);

  const score = (product: ScrapedProduct) => {
    const title = normalize(product.title);
    let matches = 0;
    for (const word of queryWords) {
      if (title.includes(word)) matches++;
    }
    return matches;
  };

  return [...products].sort((a, b) => score(b) - score(a));
}

async function searchOneBrand(
  adapter: BrandAdapter,
  params: SearchParams
): Promise<ScrapedProduct[]> {
  const cacheKey = buildCacheKey(adapter.id, params.query, params.category, params.gender);

  const cached = await getCachedProducts(cacheKey);
  if (cached) return cached;

  const results = await adapter.search(params);
  await setCachedProducts(cacheKey, adapter.id, results);
  return results;
}

/** Runs every adapter that covers `params.category`, in parallel — one
 * brand failing (network error, empty result, not-yet-activated) never
 * blocks the others. Each brand's results are cached independently. */
export async function searchProducts(params: SearchParams): Promise<ScrapedProduct[]> {
  if (process.env.SCRAPER_ENABLED === "false") return [];

  const limit = Math.min(params.limit ?? 8, 20);
  const relevantAdapters = ADAPTERS.filter((adapter) =>
    adapter.categories.includes(params.category)
  );

  if (relevantAdapters.length === 0) return [];

  const settled = await Promise.allSettled(
    relevantAdapters.map((adapter) => searchOneBrand(adapter, { ...params, limit }))
  );

  const products = settled.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  return rankByRelevance(dedupe(products), params.query).slice(0, limit);
}
