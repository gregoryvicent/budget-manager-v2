"use client";

import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, LETTER_SPACING,
    SPACING,
} from "@/lib/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { SavingsStatsProps } from "./types/SavingsStatsProps";

export default function SavingsStats({ saved, goal, monthlyAllocation, remaining, goalReached, color }: SavingsStatsProps) {
    const { formatAmount } = useCurrency();

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: SPACING["3"] }}>
            <div>
                <div style={{
                    color:         COLORS.muted,
                    fontSize:      FONT_SIZES.xs,
                    fontFamily:    FONTS.body,
                    marginBottom:  SPACING["1"],
                    textTransform: "uppercase",
                    letterSpacing: LETTER_SPACING.wide,
                }}>
                    Ahorrado
                </div>
                <div className="text-lg sm:text-[22px]" style={{ color: COLORS.text, fontWeight: FONT_WEIGHTS.extrabold, fontFamily: FONTS.heading, lineHeight: LINE_HEIGHTS.snug }}>
                    {formatAmount(saved)}
                </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
                <div>
                    <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xs, fontFamily: FONTS.body, marginBottom: SPACING["1"] }}>Meta</div>
                    <div style={{ color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body, fontFamily: FONTS.heading }}>
                        {formatAmount(goal)}
                    </div>
                </div>
                <div style={{ width: 1, background: COLORS.cardBorder }} />
                <div>
                    <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xs, fontFamily: FONTS.body, marginBottom: SPACING["1"] }}>Mensual</div>
                    <div style={{ color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, fontFamily: FONTS.heading }}>
                        {formatAmount(monthlyAllocation)}
                    </div>
                </div>
                <div style={{ width: 1, background: COLORS.cardBorder }} />
                <div>
                    <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xs, fontFamily: FONTS.body, marginBottom: SPACING["1"] }}>Restante</div>
                    <div style={{ color: goalReached ? COLORS.goal : COLORS.muted, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body, fontFamily: FONTS.heading }}>
                        {goalReached ? "¡Listo!" : formatAmount(remaining)}
                    </div>
                </div>
            </div>
        </div>
    );
}
