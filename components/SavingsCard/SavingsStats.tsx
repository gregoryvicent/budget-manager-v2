import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, LETTER_SPACING,
    SPACING, formatCurrency,
} from "@/lib/theme";
import { SavingsStatsProps } from "./types/SavingsStatsProps";

export default function SavingsStats({ saved, goal, monthlyAllocation, remaining, goalReached, color }: SavingsStatsProps) {
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
                <div style={{ color: COLORS.text, fontWeight: FONT_WEIGHTS.extrabold, fontSize: FONT_SIZES["3xl"], fontFamily: FONTS.heading, lineHeight: LINE_HEIGHTS.snug }}>
                    {formatCurrency(saved)}
                </div>
            </div>

            <div style={{ display: "flex", gap: SPACING["4"] }}>
                <div>
                    <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xs, fontFamily: FONTS.body, marginBottom: SPACING["1"] }}>Meta</div>
                    <div style={{ color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body, fontFamily: FONTS.heading }}>
                        {formatCurrency(goal)}
                    </div>
                </div>
                <div style={{ width: 1, background: COLORS.cardBorder }} />
                <div>
                    <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xs, fontFamily: FONTS.body, marginBottom: SPACING["1"] }}>Mensual</div>
                    <div style={{ color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, fontFamily: FONTS.heading }}>
                        {formatCurrency(monthlyAllocation)}
                    </div>
                </div>
                <div style={{ width: 1, background: COLORS.cardBorder }} />
                <div>
                    <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xs, fontFamily: FONTS.body, marginBottom: SPACING["1"] }}>Restante</div>
                    <div style={{ color: goalReached ? COLORS.goal : COLORS.muted, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body, fontFamily: FONTS.heading }}>
                        {goalReached ? "¡Listo!" : formatCurrency(remaining)}
                    </div>
                </div>
            </div>
        </div>
    );
}
