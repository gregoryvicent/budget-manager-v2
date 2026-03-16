import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, LETTER_SPACING,
    RADIUS, SPACING, ANIMATION_DURATIONS,
} from "@/lib/theme";
import { GoalBannerProps } from "./types/GoalBannerProps";

export default function GoalBanner({ visible }: GoalBannerProps) {
    if (!visible) return null;

    return (
        <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:             SPACING["2"],
            padding:        `${SPACING["2.5"]}px ${SPACING["4"]}px`,
            borderRadius:   RADIUS.lg,
            background:     `linear-gradient(135deg, ${COLORS.goal}18, ${COLORS.goal}08)`,
            border:         `1px solid ${COLORS.goal}40`,
            animation:      `goalBanner ${ANIMATION_DURATIONS.banner} ease forwards`,
        }}>
            <span style={{ fontSize: FONT_SIZES.lg }}>⭐</span>
            <span style={{
                color:         COLORS.goal,
                fontWeight:    FONT_WEIGHTS.bold,
                fontSize:      FONT_SIZES.body,
                fontFamily:    FONTS.heading,
                letterSpacing: LETTER_SPACING.tight,
            }}>
                ¡Meta alcanzada! Excelente trabajo.
            </span>
            <span style={{ fontSize: FONT_SIZES.lg }}>⭐</span>
        </div>
    );
}
