import { anthropic, FAST_MODEL } from "@/lib/anthropic";
import type { StyleReportResult } from "@/types/database";

export interface ProductQueries {
  ropa: string[];
  zapatos: string[];
  accesorios: string[];
}

const EMPTY: ProductQueries = { ropa: [], zapatos: [], accesorios: [] };

function buildPrompt(result: StyleReportResult): string {
  const ropaResumen = result.ropa.items
    .map((i) => `${i.titulo}: ${i.descripcion}`)
    .join("\n");

  return `Basado en este análisis de estilo personal:

Tipo de cuerpo: ${result.ropa.siluetaCuerpo}
Recomendaciones de ropa:
${ropaResumen}

Paleta de colores favorables: ${result.colores.favorables.join(", ")}

Genera queries de búsqueda para encontrar productos en tiendas colombianas.
Responde ÚNICAMENTE con JSON válido, sin markdown ni backticks:
{
  "ropa": ["query1", "query2"],
  "zapatos": ["query1", "query2"],
  "accesorios": ["query1"]
}

Reglas estrictas:
- Máximo 2 palabras por query, sin color (el buscador hace match exacto de
  todas las palabras y el color casi nunca está indexado como texto)
- En español
- Genérico: tipo de prenda + máximo un calificativo (corte, material, estilo)
- Buenos: "camisa oxford", "pantalon chino", "zapato mocasin", "camisa lino"
- Malos: "camisa oxford azul marino", "camisa de cuadros con botones dorados manga larga"`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function sanitizeQueries(list: unknown): string[] {
  if (!isStringArray(list)) return [];
  return list
    .map((q) => q.trim())
    .filter((q) => q.length > 0 && q.split(/\s+/).length <= 3)
    .slice(0, 2);
}

/**
 * Second, lightweight Claude call: turns the style analysis into short
 * search queries for the product-discovery scrapers. Never throws — a
 * failure here just means no product recommendations, not a broken
 * results page.
 */
export async function generateProductQueries(
  result: StyleReportResult
): Promise<ProductQueries> {
  try {
    const message = await anthropic.messages.create(
      {
        model: FAST_MODEL,
        max_tokens: 512,
        messages: [{ role: "user", content: buildPrompt(result) }],
      },
      { timeout: 4000 }
    );

    const raw = message.content.find((b) => b.type === "text")?.text ?? "";
    const clean = raw
      .replace(/^```json?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    const parsed = JSON.parse(clean) as Partial<Record<keyof ProductQueries, unknown>>;

    return {
      ropa: sanitizeQueries(parsed.ropa),
      zapatos: sanitizeQueries(parsed.zapatos),
      accesorios: sanitizeQueries(parsed.accesorios),
    };
  } catch {
    return EMPTY;
  }
}
