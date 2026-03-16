"use client";

import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, TRANSITIONS, CARD_STYLE, formatCurrency,
} from "@/lib/theme";
import { FinancialSummaryChartProps } from "./types/FinancialSummaryChartProps";

export default function FinancialSummaryChart({ data, totalIncome }: FinancialSummaryChartProps) {
    const max = Math.max(...data.map((d) => Math.abs(d.value)));

    return (
        <div style={{ ...CARD_STYLE, gap: 0 }}>
            <div style={{
                fontFamily:   FONTS.heading,
                fontWeight:   FONT_WEIGHTS.bold,
                fontSize:     FONT_SIZES.base,
                color:        COLORS.text,
                marginBottom: SPACING["5"],
            }}>
                Resumen Financiero
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: SPACING["3"] }}>
                {data.map((item, i) => {
                    const isDeficit = item.value < 0;
                    const pct      = totalIncome > 0 ? (Math.abs(item.value) / totalIncome) * 100 : 0;
                    const barWidth = max > 0 ? (Math.abs(item.value) / max) * 100 : 0;
                    return (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: SPACING["1"] }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: SPACING["2"] }}>
                                    <div style={{
                                        width: SPACING["2"], height: SPACING["2"], borderRadius: "50%",
                                        background: item.color, flexShrink: 0,
                                    }} />
                                    <span style={{
                                        color:      COLORS.muted,
                                        fontSize:   FONT_SIZES.sm,
                                        fontFamily: FONTS.body,
                                    }}>
                                        {item.name}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: SPACING["2.5"] }}>
                                    <span style={{
                                        color:      item.color,
                                        fontSize:   FONT_SIZES.sm,
                                        fontWeight: FONT_WEIGHTS.bold,
                                        fontFamily: FONTS.heading,
                                        minWidth:   38,
                                        textAlign:  "right",
                                    }}>
                                        {isDeficit ? "-" : ""}{pct.toFixed(1)}%
                                    </span>
                                    <span style={{
                                        color:      isDeficit ? item.color : COLORS.text,
                                        fontSize:   FONT_SIZES.cap,
                                        fontWeight: FONT_WEIGHTS.semibold,
                                        fontFamily: FONTS.heading,
                                        minWidth:   64,
                                        textAlign:  "right",
                                    }}>
                                        {isDeficit ? "-" : ""}{formatCurrency(Math.abs(item.value))}
                                    </span>
                                </div>
                            </div>
                            <div style={{ height: SPACING["1.5"], borderRadius: RADIUS.sm, background: COLORS.cardBorder, overflow: "hidden" }}>
                                <div style={{
                                    height:       "100%",
                                    width:        `${barWidth}%`,
                                    borderRadius: RADIUS.sm,
                                    background:   isDeficit
                                        ? `repeating-linear-gradient(45deg, ${item.color}99, ${item.color}99 4px, transparent 4px, transparent 8px)`
                                        : `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                                    transition:   `width ${TRANSITIONS.slow}`,
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
