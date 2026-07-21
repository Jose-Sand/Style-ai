import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchQueriesForCategory } from "@/lib/scrapers/run-search";
import type { BrandId, ProductCategory, ScrapedProduct } from "@/lib/scrapers/types";

export const runtime = "nodejs";
// See recommend/route.ts — kept at the Vercel Hobby-plan ceiling.
export const maxDuration = 10;

const CATEGORIES: ProductCategory[] = ["ropa", "skincare", "zapatos", "accesorios"];

interface RequestBody {
  queries?: unknown;
  category?: unknown;
  gender?: unknown;
  limit?: unknown;
}

function validate(body: RequestBody): { error: string | null } {
  if (!Array.isArray(body.queries) || body.queries.length === 0) {
    return { error: "queries debe ser un arreglo no vacío de strings" };
  }
  if (!body.queries.every((q) => typeof q === "string" && q.trim().length > 0)) {
    return { error: "cada query debe ser un string no vacío" };
  }
  if (
    typeof body.category !== "string" ||
    !CATEGORIES.includes(body.category as ProductCategory)
  ) {
    return { error: `category debe ser una de: ${CATEGORIES.join(", ")}` };
  }
  if (
    body.gender !== undefined &&
    body.gender !== "masculino" &&
    body.gender !== "femenino"
  ) {
    return { error: "gender debe ser 'masculino' o 'femenino'" };
  }
  return { error: null };
}

function groupByBrand(products: ScrapedProduct[], perBrandLimit: number) {
  const grouped: Record<BrandId, ScrapedProduct[]> = { velez: [], puntoblanco: [], hm: [] };
  for (const product of products) {
    if (grouped[product.brand].length >= perBrandLimit) continue;
    grouped[product.brand].push(product);
  }
  return grouped;
}

export async function POST(request: Request) {
  if (process.env.SCRAPER_ENABLED === "false") {
    return NextResponse.json(groupByBrand([], 8));
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { error } = validate(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const queries = Array.from(new Set((body.queries as string[]).map((q) => q.trim())));
  const category = body.category as ProductCategory;
  const gender = body.gender as "masculino" | "femenino" | undefined;
  const limit = Math.min(Number(body.limit) || 8, 20);

  const products = await searchQueriesForCategory({ queries, category, gender, limit });

  return NextResponse.json(groupByBrand(products, limit));
}
