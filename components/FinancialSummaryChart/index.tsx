"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COLORS, formatCurrency } from "@/lib/theme";

export interface BarDataItem {
    name: string;
    value: number;
    color: string;
}

interface FinancialSummaryChartProps {
    data: BarDataItem[];
}

export default function FinancialSummaryChart({ data }: FinancialSummaryChartProps) {
    return (
        <div style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 16,
            padding: 24,
        }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 16 }}>
                Resumen Financiero
            </div>
            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} barSize={32}>
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                        contentStyle={{ background: "#1f2937", border: "none", borderRadius: 10, color: "#f9fafb", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
                        formatter={(v: number) => [formatCurrency(v), ""]}
                        cursor={{ fill: "#ffffff08" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
