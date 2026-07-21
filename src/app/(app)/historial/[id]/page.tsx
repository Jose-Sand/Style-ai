import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResultsView } from "@/components/style-ai/results-view";
import type { StyleReportRow } from "@/types/database";

export default async function HistorialDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: report } = await supabase
    .from("style_reports")
    .select("*")
    .eq("id", params.id)
    .single<StyleReportRow>();

  if (!report) notFound();

  const photoPaths = Object.entries(report.photo_paths || {});
  const photoUrls = await Promise.all(
    photoPaths.map(async ([slotId, path]) => {
      const { data } = await supabase.storage
        .from("style-photos")
        .createSignedUrl(path, 60 * 60);
      return { slotId, url: data?.signedUrl };
    })
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/historial" className="text-sm text-[#A098B0] hover:text-[#F0EBE0]">
        ← Volver al historial
      </Link>

      <div className="mt-4 mb-6">
        <div className="inline-block rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#C9A84C]">
          {new Date(report.created_at).toLocaleDateString("es", { dateStyle: "long" })}
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold">Tu reporte de estilo</h1>
      </div>

      {photoUrls.some((p) => p.url) && (
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {photoUrls.map(
            ({ slotId, url }) =>
              url && (
                <img
                  key={slotId}
                  src={url}
                  alt={slotId}
                  className="h-24 w-16 flex-shrink-0 rounded-lg border border-[#C9A84C]/30 object-cover"
                />
              )
          )}
        </div>
      )}

      {report.status === "completed" && report.result ? (
        <ResultsView results={report.result} />
      ) : report.status === "failed" ? (
        <p className="text-[#E0A0A0]">
          Este análisis falló{report.error ? `: ${report.error}` : "."}
        </p>
      ) : (
        <p className="text-[#A098B0]">Este análisis todavía está en proceso.</p>
      )}
    </div>
  );
}
