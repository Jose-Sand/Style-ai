import { G, SECTIONS } from "@/lib/style-ai/constants";
import type { ResultItem as ResultItemT, StyleReportResult } from "@/types/database";

const serifFont = "'Cormorant Garamond', Georgia, serif";

const card = {
  background: "#141428",
  border: `1px solid ${G.border}`,
  borderRadius: 20,
  padding: "26px 28px",
  marginBottom: 18,
};
const secLabel = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.13em",
  textTransform: "uppercase" as const,
  marginBottom: 18,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

function PrintItem({ item, accentColor }: { item: ResultItemT; accentColor: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "14px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          minWidth: 36,
          borderRadius: 10,
          background: `${accentColor}22`,
          border: `1px solid ${accentColor}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
        }}
      >
        {item.icono}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: G.text, marginBottom: 4 }}>
          {item.titulo}
        </div>
        <div style={{ fontSize: 13, color: "#C8C2D8", lineHeight: 1.6 }}>
          {item.descripcion}
        </div>
      </div>
    </div>
  );
}

export function PrintableReport({
  results,
  generatedAt,
}: {
  results: StyleReportResult;
  generatedAt: string;
}) {
  return (
    <div
      style={{
        width: 720,
        padding: 40,
        background: G.bg,
        color: G.text,
        fontFamily: "'DM Sans', -apple-system, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: G.gold,
            border: `1px solid ${G.gold}55`,
            borderRadius: 100,
            padding: "5px 16px",
            marginBottom: 14,
            fontWeight: 700,
          }}
        >
          ✦ Style AI — Tu Análisis Personalizado
        </div>
        <h1
          style={{
            fontFamily: serifFont,
            fontSize: 34,
            fontWeight: 600,
            margin: "0 0 8px",
            color: G.gold,
          }}
        >
          Tu reporte de estilo
        </h1>
        <div style={{ fontSize: 12, color: G.muted }}>{generatedAt}</div>
      </div>

      {results.resumen && (
        <p
          style={{
            fontSize: 15,
            color: "#D8D2E8",
            lineHeight: 1.7,
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          {results.resumen}
        </p>
      )}

      <div style={card}>
        <div style={{ ...secLabel, color: SECTIONS[0].color }}>
          <span>💪</span> Físico & Salud
        </div>
        {results.fisico.items.map((item, i) => (
          <PrintItem key={i} item={item} accentColor={SECTIONS[0].color} />
        ))}
      </div>

      <div style={card}>
        <div style={{ ...secLabel, color: SECTIONS[1].color }}>
          <span>✨</span> Skincare & Cuidado facial
        </div>
        {results.skincare.items.map((item, i) => (
          <PrintItem key={i} item={item} accentColor={SECTIONS[1].color} />
        ))}
      </div>

      <div style={card}>
        <div style={{ ...secLabel, color: SECTIONS[2].color }}>
          <span>✂️</span> Corte & Estilo de cabello
        </div>
        {results.cabello.formaRostro && (
          <div
            style={{
              background: "rgba(139,127,181,0.15)",
              border: "1px solid rgba(139,127,181,0.4)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 13,
              color: "#D0C8EA",
            }}
          >
            🔍 <strong style={{ color: SECTIONS[2].color }}>Forma de rostro:</strong>{" "}
            {results.cabello.formaRostro}
          </div>
        )}
        {results.cabello.items.map((item, i) => (
          <PrintItem key={i} item={item} accentColor={SECTIONS[2].color} />
        ))}
      </div>

      <div style={card}>
        <div style={{ ...secLabel, color: G.gold }}>
          <span>🎨</span> Tu Paleta de Colores
        </div>

        <div
          style={{
            background: "rgba(201,168,76,0.12)",
            border: `1px solid ${G.gold}40`,
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontFamily: serifFont,
              fontWeight: 600,
              color: G.gold,
              marginBottom: 6,
            }}
          >
            🌟 {results.colores.temporada}
          </div>
          <div style={{ fontSize: 13, color: "#D8D2E8", lineHeight: 1.6 }}>
            {results.colores.descripcion}
          </div>
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#C8C2D8",
            marginBottom: 12,
          }}
        >
          ✅ Colores que te favorecen
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
          {(results.colores.favorables || []).map((name, i) => (
            <div key={i} style={{ textAlign: "center", width: 64 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: results.colores.favorablesHex?.[i] || "#888",
                  border: "2px solid rgba(255,255,255,0.15)",
                  marginBottom: 6,
                }}
              />
              <div style={{ fontSize: 10, color: "#C8C2D8", lineHeight: 1.3 }}>{name}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#C8C2D8",
            marginBottom: 12,
          }}
        >
          ❌ Colores a evitar
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {(results.colores.evitar || []).map((name, i) => (
            <div key={i} style={{ textAlign: "center", width: 64 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: results.colores.evitarHex?.[i] || "#888",
                  border: "2px solid rgba(255,255,255,0.15)",
                  marginBottom: 6,
                }}
              />
              <div style={{ fontSize: 10, color: "#C8C2D8", lineHeight: 1.3 }}>{name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, marginBottom: 0 }}>
        <div style={{ ...secLabel, color: SECTIONS[4].color }}>
          <span>👔</span> Estilo & Ropa
        </div>
        {results.ropa.siluetaCuerpo && (
          <div
            style={{
              background: "rgba(91,143,185,0.15)",
              border: "1px solid rgba(91,143,185,0.4)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 13,
              color: "#B8D8F0",
            }}
          >
            📐 <strong style={{ color: SECTIONS[4].color }}>Tu tipo de cuerpo:</strong>{" "}
            {results.ropa.siluetaCuerpo}
          </div>
        )}
        {results.ropa.items.map((item, i) => (
          <PrintItem key={i} item={item} accentColor={SECTIONS[4].color} />
        ))}
      </div>
    </div>
  );
}
