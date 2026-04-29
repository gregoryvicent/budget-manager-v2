"use client";

import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, TRANSITIONS, CARD_STYLE,
} from "@/lib/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { FinancialSummaryChartProps } from "./types/FinancialSummaryChartProps";

/**
 * Horizontal bar chart showing financial summary (income, expenses, savings, etc.).
 * Uses text-xs and truncate for mobile legibility. Full width within parent grid.
 *
 * @param {FinancialSummaryChartProps} props - Chart data and total income reference
 */
export default function FinancialSummaryChart({ data, totalIncome }: FinancialSummaryChartProps) {
    const { formatAmount } = useCurrency();
    const sorted = [...data].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    const max = Math.max(...sorted.map((d) => Math.abs(d.value)));

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

            <div className="flex flex-col gap-3">
                {sorted.map((item, i) => {
                    const isDeficit = item.value < 0;
                    const pct      = totalIncome > 0 ? (Math.abs(item.value) / totalIncome) * 100 : 0;
                    const barWidth = max > 0 ? (Math.abs(item.value) / max) * 100 : 0;
                    return (
                        <div key={i} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div
                                        className="shrink-0"
                                        style={{
                                            width: SPACING["2"], height: SPACING["2"], borderRadius: "50%",
                                            background: item.color,
                                        }}
                                    />
                                    <span
                                        className="text-xs truncate"
                                        style={{
                                            color:      COLORS.muted,
                                            fontFamily: FONTS.body,
                                        }}
                                    >
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0">
                                    <span
                                        className="text-xs truncate"
                                        style={{
                                            color:      item.color,
                                            fontWeight: FONT_WEIGHTS.bold,
                                            fontFamily: FONTS.heading,
                                            minWidth:   38,
                                            textAlign:  "right",
                                        }}
                                    >
                                        {isDeficit ? "-" : ""}{pct.toFixed(1)}%
                                    </span>
                                    <span
                                        className="text-xs truncate"
                                        style={{
                                            color:      isDeficit ? item.color : COLORS.text,
                                            fontWeight: FONT_WEIGHTS.semibold,
                                            fontFamily: FONTS.heading,
                                            minWidth:   64,
                                            textAlign:  "right",
                                        }}
                                    >
                                        {isDeficit ? "-" : ""}{formatAmount(Math.abs(item.value))}
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
