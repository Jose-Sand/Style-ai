"use client";

import { useState } from "react";
import { G, SECTIONS, type SectionDef } from "@/lib/style-ai/constants";
import type { ResultItem as ResultItemT, StyleReportResult } from "@/types/database";

const serifFont = "'Cormorant Garamond', Georgia, serif";

function ResultItem({
  item,
  accentColor,
}: {
  item: ResultItemT;
  accentColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "15px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          minWidth: 40,
          borderRadius: 11,
          background: `${accentColor}12`,
          border: `1px solid ${accentColor}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {item.icono}
      </div>
      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: G.text,
            marginBottom: 4,
          }}
        >
          {item.titulo}
        </div>
        <div style={{ fontSize: 13, color: G.sub, lineHeight: 1.6 }}>
          {item.descripcion}
        </div>
      </div>
    </div>
  );
}

export function ResultsView({ results }: { results: StyleReportResult }) {
  const [activeSection, setActiveSection] =
    useState<SectionDef["id"]>("fisico");

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
  const btnS = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "9px 18px",
    borderRadius: 100,
    border: `1px solid ${G.border}`,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 400,
    background: "rgba(255,255,255,0.06)",
    color: G.text,
  };
  const btnP = {
    ...btnS,
    border: "none",
    fontWeight: 600,
    background: "linear-gradient(135deg,#C9A84C,#E2C47A)",
    color: "#0D0D1A",
    boxShadow: "0 4px 20px rgba(201,168,76,0.28)",
  };

  return (
    <div>
      {results.resumen && (
        <p
          style={{
            color: G.sub,
            fontSize: 15,
            fontWeight: 300,
            maxWidth: 500,
            margin: "0 auto 20px",
            lineHeight: 1.65,
            textAlign: "center",
          }}
        >
          {results.resumen}
        </p>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 14,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 100,
              border: `1px solid ${activeSection === s.id ? s.color + "55" : G.border}`,
              background:
                activeSection === s.id
                  ? `${s.color}14`
                  : "rgba(255,255,255,0.03)",
              color: activeSection === s.id ? s.color : G.muted,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeSection === s.id ? 700 : 400,
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div style={card}>
        {activeSection === "fisico" && (
          <>
            <div style={{ ...secLabel, color: SECTIONS[0].color }}>
              <span>💪</span> Físico & Salud
            </div>
            {results.fisico.items.map((item, i) => (
              <ResultItem key={i} item={item} accentColor={SECTIONS[0].color} />
            ))}
          </>
        )}

        {activeSection === "skincare" && (
          <>
            <div style={{ ...secLabel, color: SECTIONS[1].color }}>
              <span>✨</span> Skincare & Cuidado facial
            </div>
            {results.skincare.items.map((item, i) => (
              <ResultItem key={i} item={item} accentColor={SECTIONS[1].color} />
            ))}
          </>
        )}

        {activeSection === "cabello" && (
          <>
            <div style={{ ...secLabel, color: SECTIONS[2].color }}>
              <span>✂️</span> Corte & Estilo de cabello
            </div>
            {results.cabello.formaRostro && (
              <div
                style={{
                  background: "rgba(139,127,181,0.1)",
                  border: "1px solid rgba(139,127,181,0.22)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#B0A8CC",
                  lineHeight: 1.5,
                }}
              >
                🔍{" "}
                <strong style={{ color: SECTIONS[2].color }}>
                  Forma de rostro detectada:
                </strong>{" "}
                {results.cabello.formaRostro}
              </div>
            )}
            {results.cabello.items.map((item, i) => (
              <ResultItem key={i} item={item} accentColor={SECTIONS[2].color} />
            ))}
          </>
        )}

        {activeSection === "colores" && (
          <>
            <div style={{ ...secLabel, color: G.gold }}>
              <span>🎨</span> Tu Paleta de Colores
            </div>

            <div
              style={{
                background: "rgba(201,168,76,0.08)",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontFamily: serifFont,
                  fontWeight: 600,
                  color: G.gold,
                  marginBottom: 5,
                }}
              >
                🌟 {results.colores.temporada}
              </div>
              <div style={{ fontSize: 13, color: G.sub, lineHeight: 1.6 }}>
                {results.colores.descripcion}
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: G.sub,
                  marginBottom: 12,
                }}
              >
                ✅ Colores que te favorecen
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(results.colores.favorables || []).map((name, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 14,
                        background: results.colores.favorablesHex?.[i] || "#888",
                        border: "2px solid rgba(255,255,255,0.1)",
                        boxShadow: `0 4px 14px ${results.colores.favorablesHex?.[i] || "#888"}45`,
                        marginBottom: 5,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 10,
                        color: G.muted,
                        maxWidth: 56,
                        lineHeight: 1.3,
                      }}
                    >
                      {name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: G.sub,
                  marginBottom: 12,
                }}
              >
                ❌ Colores a evitar
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(results.colores.evitar || []).map((name, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 14,
                        background: results.colores.evitarHex?.[i] || "#888",
                        border: "2px solid rgba(255,255,255,0.08)",
                        marginBottom: 5,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "repeating-linear-gradient(-45deg,transparent,transparent 4px,rgba(0,0,0,0.28) 4px,rgba(0,0,0,0.28) 6px)",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: G.muted,
                        maxWidth: 56,
                        lineHeight: 1.3,
                      }}
                    >
                      {name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeSection === "ropa" && (
          <>
            <div style={{ ...secLabel, color: SECTIONS[4].color }}>
              <span>👔</span> Estilo & Ropa
            </div>
            {results.ropa.siluetaCuerpo && (
              <div
                style={{
                  background: "rgba(91,143,185,0.1)",
                  border: "1px solid rgba(91,143,185,0.22)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#90B8D8",
                  lineHeight: 1.5,
                }}
              >
                📐{" "}
                <strong style={{ color: SECTIONS[4].color }}>
                  Tu tipo de cuerpo:
                </strong>{" "}
                {results.ropa.siluetaCuerpo}
              </div>
            )}
            {results.ropa.items.map((item, i) => (
              <ResultItem key={i} item={item} accentColor={SECTIONS[4].color} />
            ))}
          </>
        )}
      </div>

      <div
        style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}
      >
        {(() => {
          const idx = SECTIONS.findIndex((s) => s.id === activeSection);
          const prev = SECTIONS[idx - 1];
          const next = SECTIONS[idx + 1];
          return (
            <>
              <div>
                {prev && (
                  <button style={btnS} onClick={() => setActiveSection(prev.id)}>
                    ← {prev.icon} {prev.label}
                  </button>
                )}
              </div>
              <div>
                {next && (
                  <button style={btnP} onClick={() => setActiveSection(next.id)}>
                    {next.icon} {next.label} →
                  </button>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
