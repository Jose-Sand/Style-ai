
import { useState, useEffect, useRef } from "react";

/* ─── CONSTANTS ──────────────────────────────────────────────── */
const G = {
  bg: "#0D0D1A",
  bgCard: "rgba(255,255,255,0.038)",
  border: "rgba(255,255,255,0.08)",
  gold: "#C9A84C",
  goldGlow: "rgba(201,168,76,0.18)",
  text: "#F0EBE0",
  muted: "#6A6080",
  sub: "#A098B0",
};

const PHOTO_SLOTS = [
  { id: "front",    label: "Rostro frente",   desc: "De frente, buena iluminación" },
  { id: "left",     label: "Perfil izquierdo", desc: "Perfil izquierdo completo"   },
  { id: "right",    label: "Perfil derecho",   desc: "Perfil derecho completo"      },
  { id: "body",     label: "Cuerpo completo",  desc: "De pies a cabeza, frente"     },
];

const SECTIONS = [
  { id: "fisico",   label: "Físico & Salud", icon: "💪", color: "#6BAA8E" },
  { id: "skincare", label: "Skincare",        icon: "✨", color: "#C47878" },
  { id: "cabello",  label: "Cabello",         icon: "✂️", color: "#8B7FB5" },
  { id: "colores",  label: "Paleta",          icon: "🎨", color: "#C9A84C" },
  { id: "ropa",     label: "Estilo & Ropa",   icon: "👔", color: "#5B8FB9" },
];

const LOADING_STEPS = [
  "Analizando rasgos faciales...",
  "Evaluando tono y textura de piel...",
  "Calculando composición corporal...",
  "Determinando tu paleta de colores...",
  "Generando recomendaciones de estilo...",
  "Finalizando tu reporte personal...",
];

const buildPrompt = (data) => `
Eres un consultor de imagen de lujo, experto en estilo personal, análisis de color, skincare, nutrición y moda.
Analiza cuidadosamente las fotos adjuntas junto con los datos físicos del usuario.

DATOS FÍSICOS:
- Género: ${data.genero}
- Edad: ${data.edad || "no indicada"} años
- Altura: ${data.altura || "no indicada"} cm
- Peso: ${data.peso || "no indicado"} kg
- % Grasa corporal: ${data.grasaCorporal || "no indicado"}%
- Grasa visceral (escala 1–12): ${data.grasaVisceral || "no indicado"}
- Tipo de piel: ${data.tipoPiel}

INSTRUCCIÓN CRÍTICA: Responde ÚNICAMENTE con JSON válido. Sin markdown, sin backticks, sin explicaciones fuera del JSON.

{
  "resumen": "2-3 oraciones empoderadoras sobre el estado actual y el potencial de la persona",
  "fisico": {
    "items": [
      { "icono": "🥗", "titulo": "Título corto", "descripcion": "Recomendación específica y práctica basada en los datos y fotos" }
    ]
  },
  "skincare": {
    "items": [
      { "icono": "🧴", "titulo": "Título corto", "descripcion": "Recomendación específica basada en el tono y tipo de piel visible" }
    ]
  },
  "cabello": {
    "formaRostro": "Forma de rostro detectada en las fotos (Ovalado, Redondo, Cuadrado, Corazón, Diamante, Oblongo)",
    "items": [
      { "icono": "✂️", "titulo": "Título corto", "descripcion": "Corte y estilo recomendado según forma de rostro" }
    ]
  },
  "colores": {
    "temporada": "Estación de color exacta (ej: Otoño Cálido, Invierno Profundo, Primavera Brillante, Verano Suave)",
    "descripcion": "Por qué esta estación va contigo: subtono de piel, contraste natural, intensidad",
    "favorables": ["Nombre color 1", "Nombre color 2", "Nombre color 3", "Nombre color 4", "Nombre color 5", "Nombre color 6"],
    "favorablesHex": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5", "#hex6"],
    "evitar": ["Nombre color A", "Nombre color B", "Nombre color C"],
    "evitarHex": ["#hexA", "#hexB", "#hexC"]
  },
  "ropa": {
    "siluetaCuerpo": "Tipo de cuerpo detectado (Triángulo, Rectángulo, Óvalo, Triángulo invertido, Reloj de arena, Rombo)",
    "items": [
      { "icono": "👔", "titulo": "Camisas y tops", "descripcion": "Qué cortes y estilos usar" },
      { "icono": "👖", "titulo": "Pantalones", "descripcion": "Corte y fit ideal" },
      { "icono": "🧥", "titulo": "Capas y chaquetas", "descripcion": "Qué prendas exteriores te favorecen" },
      { "icono": "👟", "titulo": "Calzado", "descripcion": "Estilos de zapatos que equilibran tu figura" }
    ]
  }
}

Reglas:
- Mínimo 3 ítems, máximo 5 por sección (excepto ropa que son exactamente 4)
- Sé MUY específico y basa todo en las fotos + datos reales
- Tono: positivo, constructivo, empoderador — nunca clínico ni negativo
- Para colores: los hex deben ser colores reales y precisos
`;

/* ─── PHOTO SLOT ─────────────────────────────────────────────── */
function PhotoSlot({ slot, photo, onUpload, onRemove }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      onUpload({ target: { files: dt.files } });
    } catch (_) {}
  };

  return (
    <div
      style={{
        aspectRatio: "3/4",
        borderRadius: 16,
        border: `2px dashed ${
          photo
            ? "rgba(201,168,76,0.55)"
            : dragging
            ? "rgba(201,168,76,0.8)"
            : "rgba(255,255,255,0.1)"
        }`,
        background: photo
          ? "rgba(0,0,0,0.3)"
          : dragging
          ? "rgba(201,168,76,0.05)"
          : "rgba(255,255,255,0.02)",
        cursor: photo ? "default" : "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 6,
      }}
      onClick={() => !photo && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onUpload}
      />

      {photo ? (
        <>
          <img
            src={photo.preview}
            alt={slot.label}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <button
            style={{
              position: "absolute", top: 8, right: 8,
              background: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%", width: 26, height: 26,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", fontSize: 11, zIndex: 5,
            }}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >✕</button>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
            padding: "28px 10px 10px",
            fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: 600,
          }}>
            ✓ {slot.label}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 24, opacity: 0.25, lineHeight: 1 }}>+</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", fontWeight: 600 }}>{slot.label}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.16)", textAlign: "center", padding: "0 8px", lineHeight: 1.4 }}>
            {slot.desc}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── RESULT ITEM ────────────────────────────────────────────── */
function ResultItem({ item, accentColor }) {
  return (
    <div style={{
      display: "flex", gap: 14,
      padding: "15px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{
        width: 40, height: 40, minWidth: 40,
        borderRadius: 11,
        background: `${accentColor}12`,
        border: `1px solid ${accentColor}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>
        {item.icono}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: G.text, marginBottom: 4 }}>
          {item.titulo}
        </div>
        <div style={{ fontSize: 13, color: G.sub, lineHeight: 1.6 }}>
          {item.descripcion}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function StyleAI() {
  const [step, setStep]               = useState("upload");
  const [photos, setPhotos]           = useState({});
  const [formData, setFormData]       = useState({
    genero: "masculino", edad: "", altura: "", peso: "",
    grasaCorporal: "", grasaVisceral: "", tipoPiel: "mixta",
  });
  const [results, setResults]         = useState(null);
  const [error, setError]             = useState(null);
  const [activeSection, setActiveSection] = useState("fisico");
  const [progress, setProgress]       = useState(0);
  const [loadLabel, setLoadLabel]     = useState(LOADING_STEPS[0]);

  /* Google Fonts */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (_) {} };
  }, []);

  /* Helpers */
  const fileToBase64 = (file) => new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result.split(",")[1]);
    r.readAsDataURL(file);
  });

  const handlePhotoUpload = async (slotId, e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    const base64  = await fileToBase64(file);
    setPhotos((p) => ({ ...p, [slotId]: { preview, base64, mediaType: file.type } }));
  };

  const removePhoto = (slotId) =>
    setPhotos((p) => { const n = { ...p }; delete n[slotId]; return n; });

  const photosCount = Object.keys(photos).length;

  /* Analyze */
  const analyze = async () => {
    setStep("analyzing");
    setError(null);
    setProgress(4);
    setLoadLabel(LOADING_STEPS[0]);

    let prog = 4, labelIdx = 0;
    const interval = setInterval(() => {
      prog = Math.min(prog + Math.random() * 8 + 1.5, 89);
      setProgress(Math.round(prog));
      const newIdx = Math.min(Math.floor((prog / 90) * LOADING_STEPS.length), LOADING_STEPS.length - 1);
      if (newIdx !== labelIdx) { labelIdx = newIdx; setLoadLabel(LOADING_STEPS[newIdx]); }
    }, 700);

    try {
      const content = [];
      for (const [slotId, photo] of Object.entries(photos)) {
        const slot = PHOTO_SLOTS.find((s) => s.id === slotId);
        content.push({ type: "text", text: `[FOTO: ${slot.label} — ${slot.desc}]` });
        content.push({ type: "image", source: { type: "base64", media_type: photo.mediaType, data: photo.base64 } });
      }
      content.push({ type: "text", text: buildPrompt(formData) });

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          messages: [{ role: "user", content }],
        }),
      });

      clearInterval(interval);
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message || "Error de API");

      const raw   = data.content?.[0]?.text || "";
      const clean = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
      const parsed = JSON.parse(clean);

      setProgress(100);
      setLoadLabel("¡Análisis completo!");
      setTimeout(() => {
        setResults(parsed);
        setActiveSection("fisico");
        setStep("results");
      }, 700);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || "Error al analizar. Intenta nuevamente.");
      setStep("data");
    }
  };

  /* ── Shared style tokens ── */
  const font = "'DM Sans', -apple-system, sans-serif";
  const serifFont = "'Cormorant Garamond', Georgia, serif";

  const appStyle   = { minHeight: "100vh", background: G.bg, color: G.text, fontFamily: font };
  const wrap       = { maxWidth: 700, margin: "0 auto", padding: "0 20px 80px" };
  const hdr        = { textAlign: "center", padding: "44px 0 28px" };
  const badge      = {
    display: "inline-block", fontSize: 10, letterSpacing: "0.16em",
    textTransform: "uppercase", color: G.gold,
    background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.22)",
    borderRadius: 100, padding: "4px 14px", marginBottom: 14, fontWeight: 600,
  };
  const titleStyle = {
    fontFamily: serifFont, fontSize: "clamp(28px,5.5vw,46px)", fontWeight: 600,
    lineHeight: 1.1, margin: "0 0 10px",
    background: "linear-gradient(135deg,#F0EBE0 30%,#C9A84C 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  };
  const card       = {
    background: G.bgCard, border: `1px solid ${G.border}`,
    borderRadius: 20, padding: "26px 28px", marginBottom: 14,
  };
  const secLabel   = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.13em",
    textTransform: "uppercase", color: G.gold, marginBottom: 18,
    display: "flex", alignItems: "center", gap: 8,
  };
  const btnP       = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "13px 30px", borderRadius: 100, border: "none",
    cursor: "pointer", fontSize: 14, fontWeight: 600,
    background: "linear-gradient(135deg,#C9A84C,#E2C47A)", color: "#0D0D1A",
    boxShadow: "0 4px 20px rgba(201,168,76,0.28)", letterSpacing: "0.02em",
  };
  const btnS       = {
    ...btnP, background: "rgba(255,255,255,0.06)", color: G.text,
    boxShadow: "none", border: `1px solid ${G.border}`,
  };
  const inp        = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`,
    borderRadius: 10, padding: "11px 14px", color: G.text, fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: font,
  };
  const lbl        = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
    textTransform: "uppercase", color: G.sub, marginBottom: 6, display: "block",
  };

  /* ════════════════════════════════════════════
     STEP: UPLOAD
  ════════════════════════════════════════════ */
  if (step === "upload") return (
    <div style={appStyle}>
      <div style={wrap}>
        <div style={hdr}>
          <div style={badge}>✦ AI Style Advisor</div>
          <h1 style={titleStyle}>Tu mejor versión,<br />con inteligencia artificial</h1>
          <p style={{ color: G.muted, fontSize: 15, fontWeight: 300, margin: 0 }}>
            Sube tus fotos y recibe un análisis de imagen 100% personalizado
          </p>
        </div>

        {/* How it works */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[
            ["📸", "Fotos",    "Súbete de frente, perfiles y cuerpo"],
            ["📊", "Datos",    "Peso, grasa corporal y más (opcional)"],
            ["🪞", "Análisis", "Reporte personalizado en 60 seg"],
          ].map(([icon, t, d]) => (
            <div key={t} style={{
              flex: 1, background: G.bgCard, border: `1px solid ${G.border}`,
              borderRadius: 14, padding: "16px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: G.text, marginBottom: 3 }}>{t}</div>
              <div style={{ fontSize: 11, color: G.muted, lineHeight: 1.4 }}>{d}</div>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={secLabel}><span>📷</span>Sube tus fotos</div>
          <p style={{ color: G.muted, fontSize: 13, margin: "-10px 0 18px", lineHeight: 1.5 }}>
            Al menos 1 foto. Más ángulos = recomendaciones más precisas.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {PHOTO_SLOTS.map((slot) => (
              <PhotoSlot
                key={slot.id} slot={slot} photo={photos[slot.id]}
                onUpload={(e) => handlePhotoUpload(slot.id, e)}
                onRemove={() => removePhoto(slot.id)}
              />
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", paddingTop: 6 }}>
          <button
            style={{ ...btnP, opacity: photosCount === 0 ? 0.42 : 1, cursor: photosCount === 0 ? "not-allowed" : "pointer" }}
            disabled={photosCount === 0}
            onClick={() => setStep("data")}
          >
            Continuar →
          </button>
          <p style={{ color: G.muted, fontSize: 12, marginTop: 10 }}>
            {photosCount} foto{photosCount !== 1 ? "s" : ""} cargada{photosCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     STEP: DATA
  ════════════════════════════════════════════ */
  if (step === "data") return (
    <div style={appStyle}>
      <div style={wrap}>
        <div style={{ ...hdr, paddingBottom: 20 }}>
          <button style={{ ...btnS, fontSize: 12, padding: "7px 16px", marginBottom: 18 }}
            onClick={() => setStep("upload")}>← Volver</button>
          <div style={badge}>✦ Paso 2 de 2</div>
          <h1 style={{ ...titleStyle, fontSize: "clamp(24px,4vw,36px)" }}>Tus datos físicos</h1>
          <p style={{ color: G.muted, fontSize: 14, fontWeight: 300, margin: 0 }}>
            Todos los campos son opcionales — más info = mejor análisis
          </p>
        </div>

        {/* Photos summary */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
          {Object.entries(photos).map(([slotId, photo]) => {
            const slot = PHOTO_SLOTS.find((s) => s.id === slotId);
            return (
              <div key={slotId} style={{ position: "relative", flexShrink: 0 }}>
                <img src={photo.preview} alt={slot.label}
                  style={{ width: 52, height: 70, borderRadius: 10, objectFit: "cover",
                    border: "1.5px solid rgba(201,168,76,0.4)" }} />
              </div>
            );
          })}
          <div
            style={{
              width: 52, height: 70, borderRadius: 10, flexShrink: 0,
              background: "rgba(255,255,255,0.03)", border: `1px dashed ${G.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: G.muted, fontSize: 11, textAlign: "center", padding: 4,
            }}
            onClick={() => setStep("upload")}
          >+ foto</div>
        </div>

        <div style={card}>
          <div style={secLabel}>⚧ Género y piel</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Género</label>
              <select style={{ ...inp, appearance: "none" }}
                value={formData.genero}
                onChange={(e) => setFormData((p) => ({ ...p, genero: e.target.value }))}>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="no_binario">No binario</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Tipo de piel</label>
              <select style={{ ...inp, appearance: "none" }}
                value={formData.tipoPiel}
                onChange={(e) => setFormData((p) => ({ ...p, tipoPiel: e.target.value }))}>
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
            {[
              { key: "edad",          label: "Edad",                       ph: "Ej: 28" },
              { key: "altura",        label: "Altura (cm)",                ph: "Ej: 175" },
              { key: "peso",          label: "Peso (kg)",                  ph: "Ej: 75" },
              { key: "grasaCorporal", label: "% Grasa corporal",           ph: "Ej: 18" },
              { key: "grasaVisceral", label: "Grasa visceral (nivel 1–12)", ph: "Ej: 4" },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input style={inp} type="number" placeholder={ph}
                  value={formData[key]}
                  onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: "rgba(196,120,120,0.1)", border: "1px solid rgba(196,120,120,0.3)",
            borderRadius: 12, padding: "14px 18px", marginBottom: 14,
            color: "#E0A0A0", fontSize: 13, lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ textAlign: "center", paddingTop: 6 }}>
          <button style={btnP} onClick={analyze}>✨ Analizar con IA</button>
          <p style={{ color: G.muted, fontSize: 12, marginTop: 10 }}>
            El análisis toma entre 30 y 60 segundos
          </p>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     STEP: ANALYZING
  ════════════════════════════════════════════ */
  if (step === "analyzing") return (
    <div style={{ ...appStyle, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.12);opacity:0.45} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
      <div style={{ textAlign: "center", padding: "40px 24px", maxWidth: 400 }}>
        <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 36px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              position: "absolute",
              inset: `${-i * 18}px`,
              borderRadius: "50%",
              border: `1.5px solid rgba(201,168,76,${0.45 - i * 0.13})`,
              animation: `pulse ${1.6 + i * 0.35}s ease-in-out infinite`,
              animationDelay: `${i * 0.18}s`,
            }} />
          ))}
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            background: "linear-gradient(135deg,rgba(201,168,76,0.16),rgba(201,168,76,0.04))",
            border: "2px solid rgba(201,168,76,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 50, position: "relative",
          }}>🪞</div>
        </div>

        <div style={badge}>Analizando</div>
        <h2 style={{
          fontFamily: serifFont, fontSize: 26, fontWeight: 600,
          margin: "12px 0 8px", color: G.text,
        }}>{loadLabel}</h2>
        <p style={{ color: G.muted, fontSize: 13, marginBottom: 30 }}>
          Claude está revisando cada detalle de tu imagen
        </p>

        <div style={{ width: 260, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 100, margin: "0 auto", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: "linear-gradient(90deg,#C9A84C,#E2C47A)",
            borderRadius: 100, transition: "width 0.55s ease",
          }} />
        </div>
        <p style={{ color: G.muted, fontSize: 12, marginTop: 8 }}>{progress}%</p>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     STEP: RESULTS
  ════════════════════════════════════════════ */
  if (step === "results" && results) {
    const sec = SECTIONS.find((s) => s.id === activeSection);
    const sData = results[activeSection];

    return (
      <div style={appStyle}>
        <div style={wrap}>
          {/* Header */}
          <div style={{ ...hdr, paddingBottom: 20 }}>
            <div style={badge}>✦ Tu Análisis Personalizado</div>
            <h1 style={titleStyle}>Tu reporte de estilo</h1>
            {results.resumen && (
              <p style={{ color: G.sub, fontSize: 15, fontWeight: 300, maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>
                {results.resumen}
              </p>
            )}
          </div>

          {/* Section tabs */}
          <div style={{
            display: "flex", gap: 8, marginBottom: 14,
            overflowX: "auto", paddingBottom: 4,
            msOverflowStyle: "none", scrollbarWidth: "none",
          }}>
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 100, border: `1px solid ${activeSection === s.id ? s.color + "55" : G.border}`,
                background: activeSection === s.id ? `${s.color}14` : "rgba(255,255,255,0.03)",
                color: activeSection === s.id ? s.color : G.muted,
                cursor: "pointer", fontSize: 13, fontWeight: activeSection === s.id ? 700 : 400,
                whiteSpace: "nowrap", transition: "all 0.2s",
              }}>
                <span>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>

          {/* Section content */}
          <div style={card}>

            {/* FÍSICO */}
            {activeSection === "fisico" && sData?.items && (
              <>
                <div style={{ ...secLabel, color: SECTIONS[0].color }}>
                  <span>💪</span> Físico & Salud
                </div>
                {sData.items.map((item, i) => <ResultItem key={i} item={item} accentColor={SECTIONS[0].color} />)}
              </>
            )}

            {/* SKINCARE */}
            {activeSection === "skincare" && sData?.items && (
              <>
                <div style={{ ...secLabel, color: SECTIONS[1].color }}>
                  <span>✨</span> Skincare & Cuidado facial
                </div>
                {sData.items.map((item, i) => <ResultItem key={i} item={item} accentColor={SECTIONS[1].color} />)}
              </>
            )}

            {/* CABELLO */}
            {activeSection === "cabello" && sData && (
              <>
                <div style={{ ...secLabel, color: SECTIONS[2].color }}>
                  <span>✂️</span> Corte & Estilo de cabello
                </div>
                {sData.formaRostro && (
                  <div style={{
                    background: "rgba(139,127,181,0.1)", border: "1px solid rgba(139,127,181,0.22)",
                    borderRadius: 12, padding: "12px 16px", marginBottom: 16,
                    fontSize: 13, color: "#B0A8CC", lineHeight: 1.5,
                  }}>
                    🔍 <strong style={{ color: SECTIONS[2].color }}>Forma de rostro detectada:</strong> {sData.formaRostro}
                  </div>
                )}
                {sData.items?.map((item, i) => <ResultItem key={i} item={item} accentColor={SECTIONS[2].color} />)}
              </>
            )}

            {/* COLORES */}
            {activeSection === "colores" && results.colores && (
              <>
                <div style={{ ...secLabel, color: G.gold }}><span>🎨</span> Tu Paleta de Colores</div>

                <div style={{
                  background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 14, padding: "16px 18px", marginBottom: 22,
                }}>
                  <div style={{ fontSize: 16, fontFamily: serifFont, fontWeight: 600, color: G.gold, marginBottom: 5 }}>
                    🌟 {results.colores.temporada}
                  </div>
                  <div style={{ fontSize: 13, color: G.sub, lineHeight: 1.6 }}>
                    {results.colores.descripcion}
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: G.sub, marginBottom: 12 }}>
                    ✅ Colores que te favorecen
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {(results.colores.favorables || []).map((name, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{
                          width: 50, height: 50, borderRadius: 14,
                          background: results.colores.favorablesHex?.[i] || "#888",
                          border: "2px solid rgba(255,255,255,0.1)",
                          boxShadow: `0 4px 14px ${results.colores.favorablesHex?.[i] || "#888"}45`,
                          marginBottom: 5,
                        }} />
                        <div style={{ fontSize: 10, color: G.muted, maxWidth: 56, lineHeight: 1.3 }}>{name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: G.sub, marginBottom: 12 }}>
                    ❌ Colores a evitar
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {(results.colores.evitar || []).map((name, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{
                          width: 50, height: 50, borderRadius: 14,
                          background: results.colores.evitarHex?.[i] || "#888",
                          border: "2px solid rgba(255,255,255,0.08)",
                          marginBottom: 5, position: "relative", overflow: "hidden",
                        }}>
                          <div style={{
                            position: "absolute", inset: 0,
                            background: "repeating-linear-gradient(-45deg,transparent,transparent 4px,rgba(0,0,0,0.28) 4px,rgba(0,0,0,0.28) 6px)",
                          }} />
                        </div>
                        <div style={{ fontSize: 10, color: G.muted, maxWidth: 56, lineHeight: 1.3 }}>{name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ROPA */}
            {activeSection === "ropa" && results.ropa && (
              <>
                <div style={{ ...secLabel, color: SECTIONS[4].color }}><span>👔</span> Estilo & Ropa</div>
                {results.ropa.siluetaCuerpo && (
                  <div style={{
                    background: "rgba(91,143,185,0.1)", border: "1px solid rgba(91,143,185,0.22)",
                    borderRadius: 12, padding: "12px 16px", marginBottom: 16,
                    fontSize: 13, color: "#90B8D8", lineHeight: 1.5,
                  }}>
                    📐 <strong style={{ color: SECTIONS[4].color }}>Tu tipo de cuerpo:</strong> {results.ropa.siluetaCuerpo}
                  </div>
                )}
                {results.ropa.items?.map((item, i) => <ResultItem key={i} item={item} accentColor={SECTIONS[4].color} />)}
              </>
            )}

          </div>

          {/* Navigation between sections */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            {(() => {
              const idx = SECTIONS.findIndex((s) => s.id === activeSection);
              const prev = SECTIONS[idx - 1];
              const next = SECTIONS[idx + 1];
              return (
                <>
                  <div>
                    {prev && (
                      <button style={{ ...btnS, fontSize: 12, padding: "9px 18px" }}
                        onClick={() => setActiveSection(prev.id)}>
                        ← {prev.icon} {prev.label}
                      </button>
                    )}
                  </div>
                  <div>
                    {next && (
                      <button style={{ ...btnP, fontSize: 12, padding: "9px 18px" }}
                        onClick={() => setActiveSection(next.id)}>
                        {next.icon} {next.label} →
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...btnS, fontSize: 13 }}
              onClick={() => { setStep("upload"); setPhotos({}); setResults(null); setError(null); }}>
              Nueva consulta
            </button>
            <button style={{ ...btnS, fontSize: 13 }}
              onClick={() => setStep("data")}>
              Re-analizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
