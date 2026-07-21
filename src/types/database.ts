import type { ScrapedProduct } from "@/lib/scrapers/types";

export type ReportStatus = "pending" | "completed" | "failed";
export type CachedProducts = ScrapedProduct[];

export interface StyleReportInput {
  genero: "masculino" | "femenino" | "no_binario";
  edad?: string;
  altura?: string;
  peso?: string;
  grasaCorporal?: string;
  grasaVisceral?: string;
  tipoPiel: "normal" | "seca" | "mixta" | "grasa" | "sensible";
}

export interface ResultItem {
  icono: string;
  titulo: string;
  descripcion: string;
}

export interface StyleReportResult {
  resumen: string;
  fisico: { items: ResultItem[] };
  skincare: { items: ResultItem[] };
  cabello: { formaRostro: string; items: ResultItem[] };
  colores: {
    temporada: string;
    descripcion: string;
    favorables: string[];
    favorablesHex: string[];
    evitar: string[];
    evitarHex: string[];
  };
  ropa: { siluetaCuerpo: string; items: ResultItem[] };
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      style_reports: {
        Row: {
          id: string;
          user_id: string;
          status: ReportStatus;
          input: StyleReportInput;
          result: StyleReportResult | null;
          summary: string | null;
          photo_paths: Record<string, string>;
          analysis_id: string | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: ReportStatus;
          input: StyleReportInput;
          result?: StyleReportResult | null;
          summary?: string | null;
          photo_paths?: Record<string, string>;
          analysis_id?: string | null;
          error?: string | null;
        };
        Update: {
          status?: ReportStatus;
          result?: StyleReportResult | null;
          summary?: string | null;
          photo_paths?: Record<string, string>;
          analysis_id?: string | null;
          error?: string | null;
        };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          user_id: string | null;
          results: StyleReportResult;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          results: StyleReportResult;
          is_public?: boolean;
        };
        Update: {
          is_public?: boolean;
        };
        Relationships: [];
      };
      progress_entries: {
        Row: {
          id: string;
          user_id: string;
          peso: number | null;
          grasa_corporal: number | null;
          grasa_visceral: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          peso?: number | null;
          grasa_corporal?: number | null;
          grasa_visceral?: number | null;
        };
        Update: {
          peso?: number | null;
          grasa_corporal?: number | null;
          grasa_visceral?: number | null;
        };
        Relationships: [];
      };
      product_cache: {
        Row: {
          id: string;
          cache_key: string;
          results: CachedProducts;
          brand: string | null;
          cached_at: string;
        };
        Insert: {
          id?: string;
          cache_key: string;
          results: CachedProducts;
          brand?: string | null;
          cached_at?: string;
        };
        Update: {
          results?: CachedProducts;
          cached_at?: string;
        };
        Relationships: [];
      };
      scraper_errors: {
        Row: {
          id: string;
          brand: string | null;
          error: string | null;
          url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand?: string | null;
          error?: string | null;
          url?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type StyleReportRow = Database["public"]["Tables"]["style_reports"]["Row"];
export type AnalysisRow = Database["public"]["Tables"]["analyses"]["Row"];
export type ProgressEntryRow = Database["public"]["Tables"]["progress_entries"]["Row"];
