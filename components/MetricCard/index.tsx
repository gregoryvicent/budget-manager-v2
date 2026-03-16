import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, LETTER_SPACING,
    RADIUS, SPACING, CARD_STYLE,
} from "@/lib/theme";
import { MetricCardProps } from "./types/MetricCardProps";

export default function MetricCard({ label, value, color, icon: Icon, subtitle, trend }: MetricCardProps) {
    return (
        <div style={{
            ...CARD_STYLE,
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING["5"],
            padding: `${SPACING["5"]}px ${SPACING["7"]}px`,
        }}>
            {/* Icono */}
            <div style={{
                background: color + "18",
                border: `1px solid ${color}30`,
                borderRadius: RADIUS["2xl"],
                padding: SPACING["3.5"],
                flexShrink: 0,
            }}>
                <Icon size={22} color={color} />
            </div>

            {/* Contenido */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    color:          COLORS.muted,
                    fontSize:       FONT_SIZES.sm,
                    fontFamily:     FONTS.body,
                    letterSpacing:  LETTER_SPACING.wider,
                    textTransform:  "uppercase",
                    marginBottom:   SPACING["1.5"],
                }}>
                    {label}
                </div>
                <div style={{
                    color:        COLORS.text,
                    fontWeight:   FONT_WEIGHTS.extrabold,
                    fontSize:     FONT_SIZES["4xl"],
                    fontFamily:   FONTS.heading,
                    lineHeight:   LINE_HEIGHTS.tight,
                    marginBottom: SPACING["1.5"],
                }}>
                    {value}
                </div>
                {subtitle && (
                    <div style={{ display: "flex", alignItems: "center", gap: SPACING["1"] }}>
                        {trend === "up"   && <ArrowUpRight   size={13} color={COLORS.income}   />}
                        {trend === "down" && <ArrowDownRight size={13} color={COLORS.variable} />}
                        <span style={{
                            color:      trend === "up" ? COLORS.income : trend === "down" ? COLORS.variable : COLORS.muted,
                            fontSize:   FONT_SIZES.cap,
                            fontFamily: FONTS.body,
                        }}>
                            {subtitle}
                        </span>
                    </div>
                )}
            </div>

            {/* Barra lateral de color */}
            <div style={{
                width:       3,
                alignSelf:   "stretch",
                borderRadius: RADIUS.sm,
                background:  `linear-gradient(180deg, ${color}, ${color}33)`,
                flexShrink:  0,
            }} />
        </div>
    );
}
