import type { StyleReportInput } from "@/types/database";

export function buildPrompt(data: StyleReportInput): string {
  return `
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
}
