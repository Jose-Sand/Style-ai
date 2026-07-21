import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProductQueries } from "@/lib/style-ai/product-queries";
import { searchQueriesForCategory } from "@/lib/scrapers/run-search";
import type { StyleReportResult } from "@/types/database";

export const runtime = "nodejs";
// Kept at the Vercel Hobby-plan ceiling — the internal budgets in
// product-queries.ts and run-search.ts are tuned to return well before
// this, so a slow brand/API never turns into a hard platform 504.
export const maxDuration = 10;

interface RequestBody {
  result?: StyleReportResult;
  gender?: "masculino" | "femenino";
}

/**
 * Takes a completed style analysis, asks Claude for short product search
 * queries (see lib/style-ai/product-queries.ts), then runs those queries
 * against the product scrapers for "ropa", "zapatos" and "accesorios".
 * "skincare" has no brand adapters yet, so it's always empty here.
 */
export async function POST(request: Request) {
  if (process.env.SCRAPER_ENABLED === "false") {
    return NextResponse.json({ ropa: [], zapatos: [], accesorios: [] });
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

  if (!body.result) {
    return NextResponse.json({ error: "Falta 'result'" }, { status: 400 });
  }

  const queries = await generateProductQueries(body.result);

  const [ropa, zapatos, accesorios] = await Promise.all([
    queries.ropa.length
      ? searchQueriesForCategory({ queries: queries.ropa, category: "ropa", gender: body.gender })
      : Promise.resolve([]),
    queries.zapatos.length
      ? searchQueriesForCategory({
          queries: queries.zapatos,
          category: "zapatos",
          gender: body.gender,
        })
      : Promise.resolve([]),
    queries.accesorios.length
      ? searchQueriesForCategory({
          queries: queries.accesorios,
          category: "accesorios",
          gender: body.gender,
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({ ropa, zapatos, accesorios });
}
