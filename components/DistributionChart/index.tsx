"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, SPACING, CARD_STYLE } from "@/lib/theme";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import CustomLabel from "./CustomLabel";
import CustomTooltip from "./CustomTooltip";
import { DistributionChartProps } from "./types/DistributionChartProps";

const EMPTY_SLICE = [{ name: "", value: 1, color: COLORS.cardBorder }];

/**
 * Donut chart showing budget distribution by category.
 * Responsive: reduced height, margins, and outerRadius on mobile for label clarity.
 *
 * @param {DistributionChartProps} props - Chart data array
 */
export default function DistributionChart({ data }: DistributionChartProps) {
    const isMobile = useMediaQuery("(max-width: 767px)");
    const isEmpty  = data.length === 0;
    const pieData  = isEmpty ? EMPTY_SLICE : data;

    const chartHeight  = isMobile ? 220 : 280;
    const chartMargin  = isMobile
        ? { top: 20, right: 50, bottom: 20, left: 50 }
        : { top: 32, right: 80, bottom: 32, left: 80 };
    const outerRadius  = isMobile ? 70 : 90;

    return (
        <div style={{ ...CARD_STYLE }}>
            <div style={{
                fontFamily:   FONTS.heading,
                fontWeight:   FONT_WEIGHTS.bold,
                fontSize:     FONT_SIZES.base,
                color:        COLORS.text,
                marginBottom: SPACING["2"],
            }}>
                Distribución
            </div>

            <div className="flex-1 relative" style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height={chartHeight}>
                    <PieChart margin={chartMargin}>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={isMobile ? 45 : 60}
                            outerRadius={outerRadius}
                            paddingAngle={isEmpty ? 0 : 3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            labelLine={false}
                            label={isEmpty ? undefined : CustomLabel}
                        >
                            {pieData.map((item, i) => (
                                <Cell key={i} fill={item.color} stroke="transparent" />
                            ))}
                        </Pie>
                        {!isEmpty && <Tooltip content={<CustomTooltip />} />}
                    </PieChart>
                </ResponsiveContainer>

                {isEmpty && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <div style={{
                            color:      COLORS.muted,
                            fontSize:   FONT_SIZES.sm,
                            fontFamily: FONTS.body,
                        }}>
                            Sin datos este mes
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
