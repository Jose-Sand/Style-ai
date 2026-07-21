import { fetchJsonPolite } from "./base";
import type { BrandAdapter, ProductGender, ScrapedProduct, SearchParams } from "./types";

// Vélez runs on VTEX. Its robots.txt disallows the HTML search page
// (`/busca/`) and query strings in general, but explicitly allows the
// VTEX catalog/GraphQL API paths — this is the storefront's own public
// data endpoint (the same one the site's JS uses to render search
// results), not a scraped or reverse-engineered backend.
const SEARCH_BASE = "https://www.velez.com.co/api/catalog_system/pub/products/search";

interface VtexImage {
  imageUrl: string;
}

interface VtexOffer {
  Price: number;
  IsAvailable: boolean;
}

interface VtexSeller {
  commertialOffer: VtexOffer;
}

interface VtexItem {
  images: VtexImage[];
  sellers: VtexSeller[];
}

interface VtexProduct {
  productId: string;
  productName: string;
  brand: string;
  linkText: string;
  categories: string[];
  items: VtexItem[];
}

function genderFromCategories(categories: string[]): ProductGender | undefined {
  const path = categories.join("|").toLowerCase();
  if (path.includes("/hombre/")) return "masculino";
  if (path.includes("/mujer/")) return "femenino";
  return "unisex";
}

function toScrapedProduct(
  product: VtexProduct,
  params: SearchParams
): ScrapedProduct | null {
  const item = product.items?.[0];
  const offer = item?.sellers?.[0]?.commertialOffer;
  const image = item?.images?.[0]?.imageUrl;

  if (!item || !offer || !image) return null;
  if (!offer.Price || offer.Price <= 0) return null;

  return {
    id: `velez:${product.productId}`,
    brand: "velez",
    brandLabel: "Vélez",
    title: product.productName,
    price: offer.Price,
    currency: "COP",
    image,
    url: `https://www.velez.com.co/${product.linkText}/p`,
    category: params.category,
    gender: genderFromCategories(product.categories),
    available: offer.IsAvailable,
  };
}

function searchUrl(query: string, limit: number): string {
  return `${SEARCH_BASE}?ft=${encodeURIComponent(query)}&_from=0&_to=${limit - 1}`;
}

// Vélez's `ft=` search matches all terms conjunctively against a fairly
// narrow indexed text (title/category, not per-SKU color). Verified
// against the live API: "mocasin" and "camisa oxford" return results,
// but "mocasin azul" or "reloj acero plateado" reliably return zero —
// one color/material word is often enough to zero out an otherwise-valid
// query, and sometimes needs dropping two words to recover ("reloj acero
// plateado" → "reloj acero" → "reloj"). Progressively drop the last word
// and retry until something comes back or we're down to one word.
function queryVariants(query: string): string[] {
  const words = query.trim().split(/\s+/).filter(Boolean);
  const variants: string[] = [];
  for (let end = words.length; end >= 1; end--) {
    variants.push(words.slice(0, end).join(" "));
  }
  return variants;
}

export const velezAdapter: BrandAdapter = {
  id: "velez",
  label: "Vélez",
  categories: ["ropa", "zapatos", "accesorios"],
  async search(params: SearchParams): Promise<ScrapedProduct[]> {
    const limit = Math.min(params.limit ?? 8, 20);

    let data: VtexProduct[] | null = null;
    const variants = queryVariants(params.query);
    for (let i = 0; i < variants.length; i++) {
      data = await fetchJsonPolite<VtexProduct[]>(searchUrl(variants[i], limit), "velez");
      if (data && data.length > 0) break;
    }

    if (!data) return [];

    return data
      .map((product) => toScrapedProduct(product, params))
      .filter((p): p is ScrapedProduct => p !== null)
      .slice(0, limit);
  },
};
