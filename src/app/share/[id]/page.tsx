import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResultsView } from "@/components/style-ai/results-view";
import { G } from "@/lib/style-ai/constants";
import type { AnalysisRow } from "@/types/database";

export default async function SharedAnalysisPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", params.id)
    .eq("is_public", true)
    .single<AnalysisRow>();

  if (!analysis) notFound();

  return (
    <div style={{ minHeight: "100vh", background: G.bg, color: G.text }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "44px 20px 80px" }}>
        <div style={{ textAlign: "center", paddingBottom: 20 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: G.gold,
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.22)",
              borderRadius: 100,
              padding: "4px 14px",
              marginBottom: 14,
              fontWeight: 600,
            }}
          >
            ✦ Análisis compartido — Style AI
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(28px,5.5vw,42px)",
              fontWeight: 600,
              margin: "0 0 10px",
              background: "linear-gradient(135deg,#F0EBE0 30%,#C9A84C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Reporte de estilo
          </h1>
        </div>

        <ResultsView results={analysis.results} />
      </div>
    </div>
  );
}
