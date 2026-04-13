"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS,
  RADIUS, SPACING, formatCurrency,
} from "@/lib/theme";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { HistoryChartEntry } from "@/lib/types/budgetHistory";

interface HistoryBarChartProps {
  data: HistoryChartEntry[];
}

/**
 * Custom tooltip for the history bar chart.
 * Shows month name, formatted currency value, and category label.
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: RADIUS.md,
        padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
        fontFamily: FONTS.body,
        fontSize: FONT_SIZES.sm,
      }}
    >
      <p style={{ color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold, margin: 0, marginBottom: 4 }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: 0, lineHeight: 1.6 }}>
          {entry.name === "income" ? "Ingresos" : "Gastos"}: ${formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

/**
 * Grouped bar chart displaying monthly income and expenses.
 * Uses Recharts BarChart with responsive container and horizontal scroll on mobile.
 *
 * @param {HistoryBarChartProps} props - Chart data array with 12 monthly entries.
 */
export default function HistoryBarChart({ data }: HistoryBarChartProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const chartWidth = isMobile ? 600 : undefined;
  const barSize = isMobile ? 12 : 18;

  const chart = (
    <BarChart
      data={data}
      margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      barCategoryGap="20%"
    >
      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.cardBorder} vertical={false} />
      <XAxis
        dataKey="monthLabel"
        tick={{ fill: COLORS.muted, fontSize: FONT_SIZES.sm, fontFamily: FONTS.body }}
        axisLine={{ stroke: COLORS.cardBorder }}
        tickLine={false}
      />
      <YAxis
        tick={{ fill: COLORS.muted, fontSize: FONT_SIZES.sm, fontFamily: FONTS.body }}
        axisLine={false}
        tickLine={false}
        tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
        width={45}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: COLORS.cardBorder + "40" }} />
      <Legend
        formatter={(value: string) => (
          <span style={{
            color: COLORS.textDim,
            fontFamily: FONTS.body,
            fontSize: FONT_SIZES.sm,
          }}>
            {value === "income" ? "Ingresos" : "Gastos"}
          </span>
        )}
      />
      <Bar dataKey="income" name="income" fill={COLORS.income} radius={[RADIUS.sm, RADIUS.sm, 0, 0]} barSize={barSize} />
      <Bar dataKey="expenses" name="expenses" fill={COLORS.variable} radius={[RADIUS.sm, RADIUS.sm, 0, 0]} barSize={barSize} />
    </BarChart>
  );

  if (isMobile) {
    return (
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ width: chartWidth, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chart}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        {chart}
      </ResponsiveContainer>
    </div>
  );
}
