import { createClient } from "@/lib/supabase/server";
import { ProgressDashboard } from "@/components/progress/progress-dashboard";
import type { ProgressEntryRow } from "@/types/database";

export default async function ProgresoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("progress_entries")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true })
    .returns<ProgressEntryRow[]>();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="mb-2 font-serif text-3xl font-semibold">Mi Progreso</h1>
      <p className="mb-6 text-sm text-[#6A6080]">
        Registra tus medidas y observa tu evolución en el tiempo.
      </p>
      <ProgressDashboard entries={entries ?? []} />
    </div>
  );
}
