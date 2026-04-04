import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, LETTER_SPACING,
    RADIUS, SPACING,
} from "@/lib/theme";
import { MetricCardProps } from "./types/MetricCardProps";

/**
 * Displays a key performance indicator card with icon, value, and optional trend.
 * Uses Tailwind responsive classes for padding and font sizing (mobile-first).
 *
 * @param {MetricCardProps} props - Card configuration including label, value, color, icon, subtitle, and trend
 */
export default function MetricCard({ label, value, color, icon: Icon, subtitle, trend }: MetricCardProps) {
    return (
        <div
            className="flex flex-row items-center gap-5 p-4 lg:px-7 lg:py-5 rounded-[16px]"
            style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.cardBorder}`,
            }}
        >
            {/* Icon */}
            <div
                className="shrink-0"
                style={{
                    background: color + "18",
                    border: `1px solid ${color}30`,
                    borderRadius: RADIUS["2xl"],
                    padding: SPACING["3.5"],
                }}
            >
                <Icon size={22} color={color} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div
                    className="uppercase mb-1.5"
                    style={{
                        color: COLORS.muted,
                        fontSize: FONT_SIZES.sm,
                        fontFamily: FONTS.body,
                        letterSpacing: LETTER_SPACING.wider,
                    }}
                >
                    {label}
                </div>
                <div
                    className="text-2xl lg:text-[28px] truncate mb-1.5"
                    style={{
                        color: COLORS.text,
                        fontWeight: FONT_WEIGHTS.extrabold,
                        fontFamily: FONTS.heading,
                        lineHeight: LINE_HEIGHTS.tight,
                    }}
                >
                    {value}
                </div>
                {subtitle && (
                    <div className="flex items-center gap-1">
                        {trend === "up"   && <ArrowUpRight   size={13} color={COLORS.income}   />}
                        {trend === "down" && <ArrowDownRight size={13} color={COLORS.variable} />}
                        <span style={{
                            color: trend === "up" ? COLORS.income : trend === "down" ? COLORS.variable : COLORS.muted,
                            fontSize: FONT_SIZES.cap,
                            fontFamily: FONTS.body,
                        }}>
                            {subtitle}
                        </span>
                    </div>
                )}
            </div>

            {/* Color side bar */}
            <div
                className="w-[3px] self-stretch shrink-0"
                style={{
                    borderRadius: RADIUS.sm,
                    background: `linear-gradient(180deg, ${color}, ${color}33)`,
                }}
            />
        </div>
    );
}
