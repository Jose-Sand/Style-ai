"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { G, LOADING_STEPS, PHOTO_SLOTS } from "@/lib/style-ai/constants";
import { PhotoSlot, type PhotoState } from "./photo-slot";
import { ResultsView } from "./results-view";
import type { StyleReportInput, StyleReportResult } from "@/types/database";

type Step = "upload" | "data" | "analyzing" | "results";

const font = "'DM Sans', -apple-system, sans-serif";
const serifFont = "'Cormorant Garamond', Georgia, serif";

const wrap = { maxWidth: 700, margin: "0 auto", padding: "0 20px 80px" };
const hdr = { textAlign: "center" as const, padding: "44px 0 28px" };
const badge = {
  display: "inline-block",
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
  color: G.gold,
  background: "rgba(201,168,76,0.1)",
  border: "1px solid rgba(201,168,76,0.22)",
  borderRadius: 100,
  padding: "4px 14px",
  marginBottom: 14,
  fontWeight: 600,
};
const titleStyle = {
  fontFamily: serifFont,
  fontSize: "clamp(28px,5.5vw,46px)",
  fontWeight: 600,
  lineHeight: 1.1,
  margin: "0 0 10px",
  background: "linear-gradient(135deg,#F0EBE0 30%,#C9A84C 100%)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
};
const card = {
  background: G.bgCard,
  border: `1px solid ${G.border}`,
  borderRadius: 20,
  padding: "26px 28px",
  marginBottom: 14,
};
const secLabel = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.13em",
  textTransform: "uppercase" as const,
  color: G.gold,
  marginBottom: 18,
  display: "flex",
  alignItems: "center",
  gap: 8,
};
const btnP = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "13px 30px",
  borderRadius: 100,
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  background: "linear-gradient(135deg,#C9A84C,#E2C47A)",
  color: "#0D0D1A",
  boxShadow: "0 4px 20px rgba(201,168,76,0.28)",
  letterSpacing: "0.02em",
};
const btnS = {
  ...btnP,
  background: "rgba(255,255,255,0.06)",
  color: G.text,
  boxShadow: "none",
  border: `1px solid ${G.border}`,
};
const inp = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${G.border}`,
  borderRadius: 10,
  padding: "11px 14px",
  color: G.text,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box" as const,
  fontFamily: font,
};
const lbl = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase" as const,
  color: G.sub,
  marginBottom: 6,
  display: "block",
};

export function Analyzer() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [photos, setPhotos] = useState<Record<string, PhotoState>>({});
  const [formData, setFormData] = useState<StyleReportInput>({
    genero: "masculino",
    edad: "",
    altura: "",
    peso: "",
    grasaCorporal: "",
    grasaVisceral: "",
    tipoPiel: "mixta",
  });
  const [results, setResults] = useState<StyleReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadLabel, setLoadLabel] = useState(LOADING_STEPS[0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      Object.values(photos).forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhotoUpload = (slotId: string, file: File) => {
    const preview = URL.createObjectURL(file);
    setPhotos((p) => ({ ...p, [slotId]: { file, preview } }));
  };

  const removePhoto = (slotId: string) =>
    setPhotos((p) => {
      const n = { ...p };
      if (n[slotId]) URL.revokeObjectURL(n[slotId].preview);
      delete n[slotId];
      return n;
    });

  const photosCount = Object.keys(photos).length;

  const analyze = async () => {
    setStep("analyzing");
    setError(null);
    setProgress(4);
    setLoadLabel(LOADING_STEPS[0]);

    let prog = 4;
    let labelIdx = 0;
    intervalRef.current = setInterval(() => {
      prog = Math.min(prog + Math.random() * 8 + 1.5, 89);
      setProgress(Math.round(prog));
      const newIdx = Math.min(
        Math.floor((prog / 90) * LOADING_STEPS.length),
        LOADING_STEPS.length - 1
      );
      if (newIdx !== labelIdx) {
        labelIdx = newIdx;
        setLoadLabel(LOADING_STEPS[newIdx]);
      }
    }, 700);

    try {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) body.append(key, value);
      });
      Object.entries(photos).forEach(([slotId, photo]) => {
        body.append(`photo_${slotId}`, photo.file);
      });

      const resp = await fetch("/api/analyze", { method: "POST", body });
      const data = await resp.json();

      if (intervalRef.current) clearInterval(intervalRef.current);

      if (!resp.ok) throw new Error(data.error || "Error de API");

      setProgress(100);
      setLoadLabel("¡Análisis completo!");
      setTimeout(() => {
        setResults(data.result);
        setStep("results");
      }, 700);
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setError(err instanceof Error ? err.message : "Error al analizar. Intenta nuevamente.");
      setStep("data");
    }
  };

  if (step === "upload") {
    return (
      <div style={wrap}>
        <div style={hdr}>
          <div style={badge}>✦ AI Style Advisor</div>
          <h1 style={titleStyle}>
            Tu mejor versión,
            <br />
            con inteligencia artificial
          </h1>
          <p style={{ color: G.muted, fontSize: 15, fontWeight: 300, margin: 0 }}>
            Sube tus fotos y recibe un análisis de imagen 100% personalizado
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[
            ["📸", "Fotos", "Súbete de frente, perfiles y cuerpo"],
            ["📊", "Datos", "Peso, grasa corporal y más (opcional)"],
            ["🪞", "Análisis", "Reporte personalizado en 60 seg"],
          ].map(([icon, t, d]) => (
            <div
              key={t}
              style={{
                flex: 1,
                background: G.bgCard,
                border: `1px solid ${G.border}`,
                borderRadius: 14,
                padding: "16px 12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: G.text, marginBottom: 3 }}>
                {t}
              </div>
              <div style={{ fontSize: 11, color: G.muted, lineHeight: 1.4 }}>{d}</div>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={secLabel}>
            <span>📷</span>Sube tus fotos
          </div>
          <p style={{ color: G.muted, fontSize: 13, margin: "-10px 0 18px", lineHeight: 1.5 }}>
            Al menos 1 foto. Más ángulos = recomendaciones más precisas.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {PHOTO_SLOTS.map((slot) => (
              <PhotoSlot
                key={slot.id}
                slot={slot}
                photo={photos[slot.id]}
                onUpload={(file) => handlePhotoUpload(slot.id, file)}
                onRemove={() => removePhoto(slot.id)}
              />
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", paddingTop: 6 }}>
          <button
            style={{
              ...btnP,
              opacity: photosCount === 0 ? 0.42 : 1,
              cursor: photosCount === 0 ? "not-allowed" : "pointer",
            }}
            disabled={photosCount === 0}
            onClick={() => setStep("data")}
          >
            Continuar →
          </button>
          <p style={{ color: G.muted, fontSize: 12, marginTop: 10 }}>
            {photosCount} foto{photosCount !== 1 ? "s" : ""} cargada
            {photosCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    );
  }

  if (step === "data") {
    return (
      <div style={wrap}>
        <div style={{ ...hdr, paddingBottom: 20 }}>
          <button
            style={{ ...btnS, fontSize: 12, padding: "7px 16px", marginBottom: 18 }}
            onClick={() => setStep("upload")}
          >
            ← Volver
          </button>
          <div style={badge}>✦ Paso 2 de 2</div>
          <h1 style={{ ...titleStyle, fontSize: "clamp(24px,4vw,36px)" }}>
            Tus datos físicos
          </h1>
          <p style={{ color: G.muted, fontSize: 14, fontWeight: 300, margin: 0 }}>
            Todos los campos son opcionales — más info = mejor análisis
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 14,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {Object.entries(photos).map(([slotId, photo]) => {
            const slot = PHOTO_SLOTS.find((s) => s.id === slotId)!;
            return (
              <img
                key={slotId}
                src={photo.preview}
                alt={slot.label}
                style={{
                  width: 52,
                  height: 70,
                  borderRadius: 10,
                  objectFit: "cover",
                  border: "1.5px solid rgba(201,168,76,0.4)",
                  flexShrink: 0,
                }}
              />
            );
          })}
          <div
            style={{
              width: 52,
              height: 70,
              borderRadius: 10,
              flexShrink: 0,
              background: "rgba(255,255,255,0.03)",
              border: `1px dashed ${G.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: G.muted,
              fontSize: 11,
              textAlign: "center",
              padding: 4,
            }}
            onClick={() => setStep("upload")}
          >
            + foto
          </div>
        </div>

        <div style={card}>
          <div style={secLabel}>⚧ Género y piel</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Género</label>
              <select
                style={{ ...inp, appearance: "none" }}
                value={formData.genero}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    genero: e.target.value as StyleReportInput["genero"],
                  }))
                }
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="no_binario">No binario</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Tipo de piel</label>
              <select
                style={{ ...inp, appearance: "none" }}
                value={formData.tipoPiel}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    tipoPiel: e.target.value as StyleReportInput["tipoPiel"],
                  }))
                }
              >
                <option value="normal">Normal</option>
                <option value="seca">Seca</option>
                <option value="mixta">Mixta</option>
                <option value="grasa">Grasa</option>
                <option value="sensible">Sensible</option>
              </select>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={secLabel}>📏 Medidas corporales</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(
              [
                ["edad", "Edad", "Ej: 28"],
                ["altura", "Altura (cm)", "Ej: 175"],
                ["peso", "Peso (kg)", "Ej: 75"],
                ["grasaCorporal", "% Grasa corporal", "Ej: 18"],
                ["grasaVisceral", "Grasa visceral (nivel 1–12)", "Ej: 4"],
              ] as const
            ).map(([key, label, ph]) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input
                  style={inp}
                  type="number"
                  placeholder={ph}
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(196,120,120,0.1)",
              border: "1px solid rgba(196,120,120,0.3)",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 14,
              color: "#E0A0A0",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ textAlign: "center", paddingTop: 6 }}>
          <button style={btnP} onClick={analyze}>
            ✨ Analizar con IA
          </button>
          <p style={{ color: G.muted, fontSize: 12, marginTop: 10 }}>
            El análisis toma entre 30 y 60 segundos
          </p>
        </div>
      </div>
    );
  }

  if (step === "analyzing") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <style>{`
          @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.12);opacity:0.45} }
        `}</style>
        <div style={{ textAlign: "center", padding: "40px 24px", maxWidth: 400 }}>
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 36px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: `${-i * 18}px`,
                  borderRadius: "50%",
                  border: `1.5px solid rgba(201,168,76,${0.45 - i * 0.13})`,
                  animation: `pulse ${1.6 + i * 0.35}s ease-in-out infinite`,
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,rgba(201,168,76,0.16),rgba(201,168,76,0.04))",
                border: "2px solid rgba(201,168,76,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 50,
                position: "relative",
              }}
            >
              🪞
            </div>
          </div>

          <div style={badge}>Analizando</div>
          <h2
            style={{
              fontFamily: serifFont,
              fontSize: 26,
              fontWeight: 600,
              margin: "12px 0 8px",
              color: G.text,
            }}
          >
            {loadLabel}
          </h2>
          <p style={{ color: G.muted, fontSize: 13, marginBottom: 30 }}>
            Claude está revisando cada detalle de tu imagen
          </p>

          <div
            style={{
              width: 260,
              height: 4,
              background: "rgba(255,255,255,0.07)",
              borderRadius: 100,
              margin: "0 auto",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg,#C9A84C,#E2C47A)",
                borderRadius: 100,
                transition: "width 0.55s ease",
              }}
            />
          </div>
          <p style={{ color: G.muted, fontSize: 12, marginTop: 8 }}>{progress}%</p>
        </div>
      </div>
    );
  }

  if (step === "results" && results) {
    return (
      <div style={wrap}>
        <div style={{ ...hdr, paddingBottom: 20 }}>
          <div style={badge}>✦ Tu Análisis Personalizado</div>
          <h1 style={titleStyle}>Tu reporte de estilo</h1>
        </div>

        <ResultsView results={results} />

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={{ ...btnS, fontSize: 13 }}
            onClick={() => {
              Object.values(photos).forEach((p) => URL.revokeObjectURL(p.preview));
              setStep("upload");
              setPhotos({});
              setResults(null);
              setError(null);
            }}
          >
            Nueva consulta
          </button>
          <button style={{ ...btnS, fontSize: 13 }} onClick={() => router.push("/historial")}>
            Ver historial
          </button>
        </div>
      </div>
    );
  }

  return null;
}
