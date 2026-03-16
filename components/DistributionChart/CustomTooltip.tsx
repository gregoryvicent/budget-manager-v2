import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, formatCurrency } from "@/lib/theme";
import { CustomTooltipProps } from "./types/CustomTooltipProps";

export default function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    const color: string = entry.payload?.color ?? COLORS.text;
    return (
        <div style={{
            background:   COLORS.cardBorder,
            border:       `1px solid ${color}44`,
            borderRadius: RADIUS.lg,
            padding:      `${SPACING["2"]}px ${SPACING["3.5"]}px`,
            fontFamily:   FONTS.body,
        }}>
            <div style={{ color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.cap, marginBottom: SPACING["1"], fontFamily: FONTS.heading }}>
                {entry.name}
            </div>
            <div style={{ color: COLORS.text, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold }}>
                {formatCurrency(entry.value)}
            </div>
        </div>
    );
}
