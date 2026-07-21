import type { BrandAdapter, ScrapedProduct } from "./types";

/**
 * Punto Blanco (puntoblanco.com) sits behind an active Cloudflare bot
 * challenge — it blocks even a plain robots.txt fetch with a real Chrome
 * User-Agent (verified 2026-07). There's no public affiliate or partner
 * feed program for this brand either.
 *
 * Automating past that challenge would mean deliberately defeating a
 * site's active anti-bot protection, which this app won't do. This
 * adapter is a no-op placeholder so the orchestrator's brand routing and
 * the UI don't need to change when a legitimate data source shows up.
 *
 * To activate: get a direct commercial/data-partnership agreement with
 * Grupo Crystal (Punto Blanco's parent) for a product feed or API, then
 * replace `search()` below with a real implementation against that feed.
 */
export const puntoblancoAdapter: BrandAdapter = {
  id: "puntoblanco",
  label: "Punto Blanco",
  categories: [],
  async search(): Promise<ScrapedProduct[]> {
    return [];
  },
};
