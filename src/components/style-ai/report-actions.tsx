"use client";

import { useRef, useState } from "react";
import { G } from "@/lib/style-ai/constants";
import { PrintableReport } from "./printable-report";
import { exportElementToPdf } from "@/lib/style-ai/export-pdf";
import type { StyleReportResult } from "@/types/database";

const btnS = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "9px 18px",
  borderRadius: 100,
  border: `1px solid ${G.border}`,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  background: "rgba(255,255,255,0.06)",
  color: G.text,
};

export function ReportActions({
  results,
  createdAt,
  analysisId,
}: {
  results: StyleReportResult;
  createdAt?: string;
  analysisId?: string | null;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const generatedAt = new Date(createdAt ?? Date.now()).toLocaleDateString("es", {
    dateStyle: "long",
  });

  const handleExport = async () => {
    if (!printRef.current) return;
    setExporting(true);
    setExportError(null);
    try {
      const dateSlug = new Date().toISOString().slice(0, 10);
      await exportElementToPdf(printRef.current, `mi-analisis-estilo-${dateSlug}.pdf`);
    } catch {
      setExportError("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!analysisId) return;
    setShareError(null);
    try {
      const url = `${window.location.origin}/share/${analysisId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareError("No se pudo copiar el link.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button style={btnS} onClick={handleExport} disabled={exporting}>
          {exporting ? "Generando PDF..." : "📄 Exportar PDF"}
        </button>
        {analysisId && (
          <button style={btnS} onClick={handleShare}>
            {copied ? "✓ Link copiado" : "🔗 Compartir"}
          </button>
        )}
      </div>
      {(exportError || shareError) && (
        <p style={{ textAlign: "center", color: "#E0A0A0", fontSize: 12, marginTop: 8 }}>
          {exportError || shareError}
        </p>
      )}

      {/* Off-screen printable version, captured by html2canvas on export */}
      <div style={{ position: "fixed", top: 0, left: -10000, zIndex: -1 }}>
        <div ref={printRef}>
          <PrintableReport results={results} generatedAt={generatedAt} />
        </div>
      </div>
    </div>
  );
}
