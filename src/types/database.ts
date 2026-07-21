export type ReportStatus = "pending" | "completed" | "failed";

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
          error?: string | null;
        };
        Update: {
          status?: ReportStatus;
          result?: StyleReportResult | null;
          summary?: string | null;
          photo_paths?: Record<string, string>;
          error?: string | null;
        };
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
