export type ProductCategory = "ropa" | "skincare" | "zapatos" | "accesorios";
export type ProductGender = "masculino" | "femenino" | "unisex";
export type BrandId = "velez" | "puntoblanco" | "hm";

export interface ScrapedProduct {
  id: string;
  brand: BrandId;
  brandLabel: string;
  title: string;
  price: number;
  currency: "COP";
  image: string;
  url: string;
  category: ProductCategory;
  gender?: ProductGender;
  available: boolean;
}

export interface SearchParams {
  query: string;
  category: ProductCategory;
  gender?: "masculino" | "femenino";
  limit?: number;
}

export interface BrandAdapter {
  id: BrandId;
  label: string;
  /** Categories this adapter can currently serve results for. */
  categories: ProductCategory[];
  search(params: SearchParams): Promise<ScrapedProduct[]>;
}
