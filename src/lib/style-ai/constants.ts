export const G = {
  bg: "#0D0D1A",
  bgCard: "rgba(255,255,255,0.038)",
  border: "rgba(255,255,255,0.08)",
  gold: "#C9A84C",
  goldGlow: "rgba(201,168,76,0.18)",
  text: "#F0EBE0",
  muted: "#6A6080",
  sub: "#A098B0",
} as const;

export interface PhotoSlotDef {
  id: "front" | "left" | "right" | "body";
  label: string;
  desc: string;
}

export const PHOTO_SLOTS: PhotoSlotDef[] = [
  { id: "front", label: "Rostro frente", desc: "De frente, buena iluminación" },
  { id: "left", label: "Perfil izquierdo", desc: "Perfil izquierdo completo" },
  { id: "right", label: "Perfil derecho", desc: "Perfil derecho completo" },
  { id: "body", label: "Cuerpo completo", desc: "De pies a cabeza, frente" },
];

export interface SectionDef {
  id: "fisico" | "skincare" | "cabello" | "colores" | "ropa";
  label: string;
  icon: string;
  color: string;
}

export const SECTIONS: SectionDef[] = [
  { id: "fisico", label: "Físico & Salud", icon: "💪", color: "#6BAA8E" },
  { id: "skincare", label: "Skincare", icon: "✨", color: "#C47878" },
  { id: "cabello", label: "Cabello", icon: "✂️", color: "#8B7FB5" },
  { id: "colores", label: "Paleta", icon: "🎨", color: "#C9A84C" },
  { id: "ropa", label: "Estilo & Ropa", icon: "👔", color: "#5B8FB9" },
];

export const LOADING_STEPS = [
  "Analizando rasgos faciales...",
  "Evaluando tono y textura de piel...",
  "Calculando composición corporal...",
  "Determinando tu paleta de colores...",
  "Generando recomendaciones de estilo...",
  "Finalizando tu reporte personal...",
];
