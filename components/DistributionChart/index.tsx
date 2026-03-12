"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, formatCurrency } from "@/lib/theme";

export interface PieDataItem {
    name: string;
    value: number;
}

const PIE_COLORS = [COLORS.fixed, COLORS.variable, COLORS.savings, COLORS.investment, COLORS.income];

interface DistributionChartProps {
    data: PieDataItem[];
    totalIncome: number;
}

interface CustomLabelProps {
    cx?: number;
    cy?: number;
    midAngle?: number;
    outerRadius?: number;
    name?: string;
    value?: number;
    percent?: number;
    index?: number;
}

const RADIAN = Math.PI / 180;

function CustomLabel({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name = "", percent = 0, index = 0 }: CustomLabelProps) {
    const pct = (percent * 100).toFixed(1);
    const color = PIE_COLORS[index];

    // Punto de inicio de la línea (borde exterior del segmento)
    const lineStart = outerRadius + 4;
    const sx = cx + lineStart * Math.cos(-midAngle * RADIAN);
    const sy = cy + lineStart * Math.sin(-midAngle * RADIAN);

    // Punto intermedio
    const mx = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
    const my = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);

    // Punto final (donde aparece el texto)
    const isRight = mx > cx;
    const ex = mx + (isRight ? 12 : -12);
    const ey = my;

    const textAnchor = isRight ? "start" : "end";

    return (
        <g>
            <path
                d={`M${sx},${sy} L${mx},${my} L${ex},${ey}`}
                stroke={color}
                strokeWidth={1}
                fill="none"
                opacity={0.6}
            />
            <circle cx={ex} cy={ey} r={2} fill={color} />
            <text
                x={ex + (isRight ? 5 : -5)}
                y={ey - 6}
                textAnchor={textAnchor}
                fill={COLORS.muted}
                fontSize={10}
                fontFamily="'DM Sans', sans-serif"
            >
                {name}
            </text>
            <text
                x={ex + (isRight ? 5 : -5)}
                y={ey + 6}
                textAnchor={textAnchor}
                fill={color}
                fontSize={11}
                fontWeight={700}
                fontFamily="'Sora', sans-serif"
            >
                {pct}%
            </text>
        </g>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    const index = data_ref.findIndex((d) => d.name === entry.name);
    const color = PIE_COLORS[index] ?? "#f9fafb";
    return (
        <div style={{
            background: "#1f2937",
            border: `1px solid ${color}44`,
            borderRadius: 10,
            padding: "8px 14px",
            fontFamily: "'DM Sans', sans-serif",
        }}>
            <div style={{ color, fontWeight: 700, fontSize: 12, marginBottom: 2, fontFamily: "'Sora', sans-serif" }}>
                {entry.name}
            </div>
            <div style={{ color: "#f9fafb", fontSize: 13, fontWeight: 600 }}>
                {formatCurrency(entry.value)}
            </div>
        </div>
    );
}

let data_ref: PieDataItem[] = [];

export default function DistributionChart({ data, totalIncome: _totalIncome }: DistributionChartProps) {
    data_ref = data;
    return (
        <div style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
        }}>
            <div style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: COLORS.text,
                marginBottom: 8,
            }}>
                Distribución
            </div>

            <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart margin={{ top: 32, right: 80, bottom: 32, left: 80 }}>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            labelLine={false}
                            label={CustomLabel}
                        >
                            {data.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i]} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
