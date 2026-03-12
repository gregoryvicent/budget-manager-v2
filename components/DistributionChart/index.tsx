"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, formatCurrency } from "@/lib/theme";

export interface PieDataItem {
    name: string;
    value: number;
    color: string;
}

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
    percent?: number;
    fill?: string;
}

const RADIAN = Math.PI / 180;

function CustomLabel({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name = "", percent = 0, fill = "#fff" }: CustomLabelProps) {
    const pct = (percent * 100).toFixed(1);

    const lineStart = outerRadius + 4;
    const sx = cx + lineStart * Math.cos(-midAngle * RADIAN);
    const sy = cy + lineStart * Math.sin(-midAngle * RADIAN);

    const mx = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
    const my = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);

    const isRight = mx > cx;
    const ex = mx + (isRight ? 12 : -12);
    const ey = my;

    const textAnchor = isRight ? "start" : "end";

    return (
        <g>
            <path
                d={`M${sx},${sy} L${mx},${my} L${ex},${ey}`}
                stroke={fill}
                strokeWidth={1}
                fill="none"
                opacity={0.6}
            />
            <circle cx={ex} cy={ey} r={2} fill={fill} />
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
                fill={fill}
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
    const color: string = entry.payload?.color ?? "#f9fafb";
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

export default function DistributionChart({ data }: DistributionChartProps) {
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
                            {data.map((item, i) => (
                                <Cell key={i} fill={item.color} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
