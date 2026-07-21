import type { BrandAdapter, ScrapedProduct } from "./types";

/**
 * H&M Colombia (www2.hm.com) hard-blocks automated requests at the edge
 * (Akamai 403, even on robots.txt — verified 2026-07). Bypassing that
 * with browser automation tricks (randomized delays, silently swallowing
 * a captcha) would be deliberately evading an active anti-bot system,
 * which this app won't do regardless of the business intent behind it.
 *
 * The legitimate path is H&M's affiliate program, run through Rakuten
 * Advertising — apply for a publisher account, get approved for the H&M
 * program, and use the product feed / API access that comes with it.
 * That's a business signup step, not something this code can complete.
 *
 * This adapter is a no-op placeholder so the orchestrator's brand
 * routing and the UI don't need to change once that access exists.
 *
 * To activate: sign up at Rakuten Advertising, get approved as an H&M
 * affiliate, then replace `search()` below with a real implementation
 * against the Rakuten product feed / API.
 */
export const hmAdapter: BrandAdapter = {
  id: "hm",
  label: "H&M",
  categories: [],
  async search(): Promise<ScrapedProduct[]> {
    return [];
  },
};
