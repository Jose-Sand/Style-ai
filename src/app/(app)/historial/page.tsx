import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { StyleReportRow } from "@/types/database";

export default async function HistorialPage() {
  const supabase = createClient();
  const { data: reports } = await supabase
    .from("style_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<StyleReportRow[]>();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="mb-6 font-serif text-3xl font-semibold">Tu historial</h1>

      {!reports?.length && (
        <p className="text-[#6A6080]">Todavía no tienes análisis guardados.</p>
      )}

      <div className="space-y-3">
        {reports?.map((report) => (
          <Link
            key={report.id}
            href={`/historial/${report.id}`}
            className="block rounded-2xl border border-white/[0.08] bg-white/[0.038] p-5 transition-colors hover:border-[#C9A84C]/30"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#C9A84C]">
              <span>
                {new Date(report.created_at).toLocaleDateString("es", {
                  dateStyle: "long",
                })}
              </span>
              {report.status !== "completed" && (
                <span className="text-[#A098B0]">{report.status}</span>
              )}
            </div>
            <p className="mt-2 text-sm text-[#A098B0]">
              {report.summary || "Análisis en proceso..."}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
