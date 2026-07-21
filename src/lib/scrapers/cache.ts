import { createServiceRoleClient } from "@/lib/supabase/server";
import type { BrandId, ProductCategory, ScrapedProduct } from "./types";

const CACHE_TTL_HOURS = Number(process.env.CACHE_TTL_HOURS ?? 6);

export function buildCacheKey(
  brand: BrandId,
  query: string,
  category: ProductCategory,
  gender?: string
): string {
  return `${brand}:${query.trim().toLowerCase()}:${category}:${gender ?? "any"}`;
}

export async function getCachedProducts(cacheKey: string): Promise<ScrapedProduct[] | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("product_cache")
      .select("results, cached_at")
      .eq("cache_key", cacheKey)
      .single();

    if (!data) return null;

    const ageHours = (Date.now() - new Date(data.cached_at).getTime()) / 3_600_000;
    if (ageHours > CACHE_TTL_HOURS) return null;

    return data.results as ScrapedProduct[];
  } catch {
    return null;
  }
}

export async function setCachedProducts(
  cacheKey: string,
  brand: BrandId,
  results: ScrapedProduct[]
): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    await supabase
      .from("product_cache")
      .upsert(
        { cache_key: cacheKey, brand, results, cached_at: new Date().toISOString() },
        { onConflict: "cache_key" }
      );
  } catch {
    // Cache writes are best-effort — never block the response on this.
  }
}
