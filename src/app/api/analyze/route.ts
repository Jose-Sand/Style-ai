import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic, STYLE_AI_MODEL } from "@/lib/anthropic";
import { buildPrompt } from "@/lib/style-ai/prompt";
import { PHOTO_SLOTS } from "@/lib/style-ai/constants";
import type {
  StyleReportInput,
  StyleReportResult,
} from "@/types/database";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseInput(formData: FormData): StyleReportInput {
  const field = (key: string) => String(formData.get(key) ?? "");
  return {
    genero: (field("genero") || "masculino") as StyleReportInput["genero"],
    edad: field("edad"),
    altura: field("altura"),
    peso: field("peso"),
    grasaCorporal: field("grasaCorporal"),
    grasaVisceral: field("grasaVisceral"),
    tipoPiel: (field("tipoPiel") || "mixta") as StyleReportInput["tipoPiel"],
  };
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const input = parseInput(formData);

  const photos: { slotId: string; file: File }[] = [];
  for (const slot of PHOTO_SLOTS) {
    const file = formData.get(`photo_${slot.id}`);
    if (file instanceof File && file.size > 0) {
      photos.push({ slotId: slot.id, file });
    }
  }

  if (photos.length === 0) {
    return NextResponse.json(
      { error: "Sube al menos una foto" },
      { status: 400 }
    );
  }

  const { data: report, error: insertError } = await supabase
    .from("style_reports")
    .insert({ user_id: user.id, status: "pending", input })
    .select()
    .single();

  if (insertError || !report) {
    return NextResponse.json(
      { error: insertError?.message ?? "No se pudo crear el reporte" },
      { status: 500 }
    );
  }

  const photoPaths: Record<string, string> = {};
  const content: Array<
    | { type: "text"; text: string }
    | {
        type: "image";
        source: {
          type: "base64";
          media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
          data: string;
        };
      }
  > = [];

  try {
    for (const { slotId, file } of photos) {
      const slot = PHOTO_SLOTS.find((s) => s.id === slotId)!;
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mediaType = (file.type || "image/jpeg") as
        | "image/jpeg"
        | "image/png"
        | "image/webp"
        | "image/gif";

      const path = `${user.id}/${report.id}/${slotId}.${mediaType.split("/")[1]}`;
      const { error: uploadError } = await supabase.storage
        .from("style-photos")
        .upload(path, arrayBuffer, { contentType: mediaType, upsert: true });
      if (uploadError) throw new Error(uploadError.message);
      photoPaths[slotId] = path;

      content.push({
        type: "text",
        text: `[FOTO: ${slot.label} — ${slot.desc}]`,
      });
      content.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      });
    }

    content.push({ type: "text", text: buildPrompt(input) });

    const message = await anthropic.messages.create({
      model: STYLE_AI_MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content }],
    });

    const raw = message.content.find((b) => b.type === "text")?.text ?? "";
    const clean = raw
      .replace(/^```json?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    const result = JSON.parse(clean) as StyleReportResult;

    const { error: updateError } = await supabase
      .from("style_reports")
      .update({
        status: "completed",
        result,
        summary: result.resumen,
        photo_paths: photoPaths,
      })
      .eq("id", report.id);

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ id: report.id, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al analizar";
    await supabase
      .from("style_reports")
      .update({ status: "failed", error: message })
      .eq("id", report.id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
