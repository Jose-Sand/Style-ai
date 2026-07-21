"use client";

import { useFormState } from "react-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { G } from "@/lib/style-ai/constants";
import { addProgressEntry, type ProgressFormState } from "@/lib/actions/progress";
import { SubmitButton } from "@/components/auth/submit-button";
import type { ProgressEntryRow } from "@/types/database";

const card = {
  background: G.bgCard,
  border: `1px solid ${G.border}`,
  borderRadius: 20,
  padding: "24px 26px",
  marginBottom: 14,
};
const secLabel = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.13em",
  textTransform: "uppercase" as const,
  color: G.gold,
  marginBottom: 18,
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
};

const initialState: ProgressFormState = { error: null };

function StatCard({
  label,
  value,
  delta,
  unit,
}: {
  label: string;
  value: number | null;
  delta: number | null;
  unit: string;
}) {
  return (
    <div style={{ ...card, flex: 1, textAlign: "center" as const, marginBottom: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: G.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 600, color: G.text }}>
        {value !== null ? `${value}${unit}` : "—"}
      </div>
      {delta !== null && (
        <div
          style={{
            fontSize: 12,
            marginTop: 4,
            color: delta === 0 ? G.muted : delta < 0 ? "#6BAA8E" : "#C47878",
          }}
        >
          {delta === 0 ? "sin cambio" : `${delta > 0 ? "+" : ""}${delta}${unit} desde el inicio`}
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  data,
  dataKey,
  color,
  unit,
}: {
  title: string;
  data: { date: string; value: number | null }[];
  dataKey: string;
  color: string;
  unit: string;
}) {
  const hasData = data.some((d) => d.value !== null);

  return (
    <div style={card}>
      <div style={{ ...secLabel, color }}>{title}</div>
      {hasData ? (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" stroke={G.muted} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={G.muted} fontSize={11} tickLine={false} axisLine={false} unit={unit} width={40} />
              <Tooltip
                contentStyle={{
                  background: "#15152A",
                  border: `1px solid ${G.border}`,
                  borderRadius: 10,
                  fontSize: 12,
                  color: G.text,
                }}
                labelStyle={{ color: G.sub }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p style={{ color: G.muted, fontSize: 13 }}>Todavía no hay mediciones suficientes.</p>
      )}
    </div>
  );
}

export function ProgressDashboard({ entries }: { entries: ProgressEntryRow[] }) {
  const [state, formAction] = useFormState(addProgressEntry, initialState);

  const first = entries[0];
  const last = entries[entries.length - 1];

  const round = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);
  const delta = (a: number | null | undefined, b: number | null | undefined) =>
    a === null || a === undefined || b === null || b === undefined
      ? null
      : round(a - b);

  const chartData = entries.map((e) => ({
    date: new Date(e.created_at).toLocaleDateString("es", { day: "2-digit", month: "short" }),
    peso: e.peso,
    grasaCorporal: e.grasa_corporal,
  }));

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <StatCard
          label="Peso actual"
          value={round(last?.peso ?? null)}
          delta={delta(last?.peso ?? null, first?.peso ?? null)}
          unit=" kg"
        />
        <StatCard
          label="% Grasa corporal"
          value={round(last?.grasa_corporal ?? null)}
          delta={delta(last?.grasa_corporal ?? null, first?.grasa_corporal ?? null)}
          unit="%"
        />
      </div>

      <ChartCard
        title="📈 Peso a lo largo del tiempo"
        data={chartData.map((d) => ({ date: d.date, value: d.peso }))}
        dataKey="Peso (kg)"
        color={G.gold}
        unit=" kg"
      />
      <ChartCard
        title="📉 % Grasa corporal a lo largo del tiempo"
        data={chartData.map((d) => ({ date: d.date, value: d.grasaCorporal }))}
        dataKey="% Grasa"
        color="#6BAA8E"
        unit="%"
      />

      <div style={card}>
        <div style={secLabel}>➕ Registrar nueva medición</div>
        <form action={formAction}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Peso (kg)</label>
              <input style={inp} type="number" step="0.1" name="peso" placeholder="Ej: 75.5" />
            </div>
            <div>
              <label style={lbl}>% Grasa corporal</label>
              <input style={inp} type="number" step="0.1" name="grasa_corporal" placeholder="Ej: 18" />
            </div>
            <div>
              <label style={lbl}>Grasa visceral</label>
              <input style={inp} type="number" step="0.1" name="grasa_visceral" placeholder="Ej: 4" />
            </div>
          </div>

          {state.error && (
            <div
              style={{
                background: "rgba(196,120,120,0.1)",
                border: "1px solid rgba(196,120,120,0.3)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 14,
                color: "#E0A0A0",
                fontSize: 13,
              }}
            >
              ⚠️ {state.error}
            </div>
          )}

          <SubmitButton>Agregar medición</SubmitButton>
        </form>
      </div>
    </div>
  );
}
