"use client";

import type { ScrapedProduct } from "@/lib/scrapers/types";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const CARD_BG = "#08080F";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const GOLD = "#C9A84C";

function ProductCard({ product }: { product: ScrapedProduct }) {
  return (
    <div
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 14 }}
      className="overflow-hidden"
    >
      <div className="relative" style={{ aspectRatio: "3/4" }}>
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span
          className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{ background: "rgba(8,8,15,0.85)", color: GOLD, border: `1px solid ${GOLD}40` }}
        >
          {product.brandLabel}
        </span>
      </div>
      <div className="p-3">
        <p className="mb-1 line-clamp-2 text-[13px] font-medium leading-snug text-[#F0EBE0]">
          {product.title}
        </p>
        <p className="mb-2 text-sm font-semibold" style={{ color: GOLD }}>
          {currencyFormatter.format(product.price)}
        </p>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-full border py-1.5 text-center text-[11px] font-semibold text-[#F0EBE0] transition-colors hover:border-[#C9A84C]/50"
          style={{ borderColor: CARD_BORDER }}
        >
          Ver producto
        </a>
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl"
          style={{
            aspectRatio: "3/4.6",
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
          }}
        />
      ))}
    </div>
  );
}

export function ProductGrid({
  title,
  products,
  loading,
  error,
}: {
  title: string;
  products: ScrapedProduct[];
  loading: boolean;
  error?: string;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#C9A84C]">
        {title}
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <p className="text-sm text-[#6A6080]">No encontramos productos ahora.</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-[#6A6080]">
          No encontramos productos para esta búsqueda todavía.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
