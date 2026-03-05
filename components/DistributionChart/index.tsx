"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, formatCurrency } from "@/lib/theme";

export interface PieDataItem {
    name: string;
    value: number;
}

const PIE_COLORS = [COLORS.fixed, COLORS.variable, COLORS.income];

interface DistributionChartProps {
    data: PieDataItem[];
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
            alignItems: "center",
        }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 8, alignSelf: "flex-start" }}>
                Distribución
            </div>
            <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip
                        contentStyle={{ background: "#1f2937", border: "none", borderRadius: 10, color: "#f9fafb", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
                        formatter={(v: number) => [formatCurrency(v), ""]}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i] }} />
                            <span style={{ color: COLORS.muted, fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>{d.name}</span>
                        </div>
                        <span style={{ color: COLORS.text, fontSize: 11, fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>
                            {formatCurrency(d.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
