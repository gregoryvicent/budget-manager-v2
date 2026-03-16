"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, SPACING, CARD_STYLE } from "@/lib/theme";
import CustomLabel from "./CustomLabel";
import CustomTooltip from "./CustomTooltip";
import { DistributionChartProps } from "./types/DistributionChartProps";

export default function DistributionChart({ data }: DistributionChartProps) {
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

            <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart margin={{ top: 32, right: 80, bottom: 32, left: 80 }}>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            labelLine={false}
                            label={CustomLabel}
                        >
                            {data.map((item, i) => (
                                <Cell key={i} fill={item.color} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
