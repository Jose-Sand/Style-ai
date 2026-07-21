"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProgressFormState {
  error: string | null;
}

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function addProgressEntry(
  _prevState: ProgressFormState,
  formData: FormData
): Promise<ProgressFormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const peso = parseNumber(formData.get("peso"));
  const grasaCorporal = parseNumber(formData.get("grasa_corporal"));
  const grasaVisceral = parseNumber(formData.get("grasa_visceral"));

  if (peso === null && grasaCorporal === null && grasaVisceral === null) {
    return { error: "Ingresa al menos un valor" };
  }

  const { error } = await supabase.from("progress_entries").insert({
    user_id: user.id,
    peso,
    grasa_corporal: grasaCorporal,
    grasa_visceral: grasaVisceral,
  });

  if (error) return { error: error.message };

  revalidatePath("/progreso");
  return { error: null };
}
