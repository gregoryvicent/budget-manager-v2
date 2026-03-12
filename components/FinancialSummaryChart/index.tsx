"use client";

import { COLORS, formatCurrency } from "@/lib/theme";

export interface BarDataItem {
    name: string;
    value: number;
    color: string;
}

interface FinancialSummaryChartProps {
    data: BarDataItem[];
    totalIncome: number;
}

export default function FinancialSummaryChart({ data, totalIncome }: FinancialSummaryChartProps) {
    const max = Math.max(...data.map((d) => d.value));

    return (
        <div style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 0,
        }}>
            <div style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: COLORS.text,
                marginBottom: 20,
            }}>
                Resumen Financiero
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.map((item, i) => {
                    const pct = totalIncome > 0 ? (item.value / totalIncome) * 100 : 0;
                    const barWidth = max > 0 ? (item.value / max) * 100 : 0;
                    return (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: "50%",
                                        background: item.color, flexShrink: 0,
                                    }} />
                                    <span style={{
                                        color: COLORS.muted, fontSize: 11,
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}>
                                        {item.name}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{
                                        color: item.color, fontSize: 11, fontWeight: 700,
                                        fontFamily: "'Sora', sans-serif", minWidth: 38, textAlign: "right",
                                    }}>
                                        {pct.toFixed(1)}%
                                    </span>
                                    <span style={{
                                        color: COLORS.text, fontSize: 12, fontWeight: 600,
                                        fontFamily: "'Sora', sans-serif", minWidth: 64, textAlign: "right",
                                    }}>
                                        {formatCurrency(item.value)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ height: 6, borderRadius: 4, background: "#1f2937", overflow: "hidden" }}>
                                <div style={{
                                    height: "100%",
                                    width: `${barWidth}%`,
                                    borderRadius: 4,
                                    background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                                    transition: "width 0.8s ease",
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
