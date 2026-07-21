import { delay } from "./base";
import { searchProducts } from "./index";
import type { ProductCategory, ScrapedProduct } from "./types";

export interface CategorySearchParams {
  queries: string[];
  category: ProductCategory;
  gender?: "masculino" | "femenino";
  limit?: number;
  budgetMs?: number;
}

const DEFAULT_BUDGET_MS = Math.max(
  Number(process.env.SCRAPER_TIMEOUT_MS ?? 25000) - 3000,
  5000
);

/**
 * Runs every query for one category against the relevant brand adapters,
 * within a shared time budget — if the budget runs out before all
 * queries resolve, whatever already came back is returned instead of
 * waiting (or failing) on the slow ones.
 */
export async function searchQueriesForCategory(
  params: CategorySearchParams
): Promise<ScrapedProduct[]> {
  const limit = Math.min(params.limit ?? 8, 20);
  const budgetMs = params.budgetMs ?? DEFAULT_BUDGET_MS;

  const collected: ScrapedProduct[] = [];
  const queryPromises = params.queries.map(async (query) => {
    const products = await searchProducts({
      query,
      category: params.category,
      gender: params.gender,
      limit,
    });
    collected.push(...products);
  });

  await Promise.race([Promise.allSettled(queryPromises), delay(budgetMs)]);

  const seen = new Set<string>();
  const result: ScrapedProduct[] = [];
  for (const product of collected) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    result.push(product);
    if (result.length >= limit) break;
  }
  return result;
}
