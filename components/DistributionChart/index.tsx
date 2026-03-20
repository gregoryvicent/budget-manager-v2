"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, SPACING, CARD_STYLE } from "@/lib/theme";
import CustomLabel from "./CustomLabel";
import CustomTooltip from "./CustomTooltip";
import { DistributionChartProps } from "./types/DistributionChartProps";

const EMPTY_SLICE = [{ name: "", value: 1, color: COLORS.cardBorder }];

export default function DistributionChart({ data }: DistributionChartProps) {
    const isEmpty    = data.length === 0;
    const pieData    = isEmpty ? EMPTY_SLICE : data;

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

            <div style={{ flex: 1, position: "relative" }}>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart margin={{ top: 32, right: 80, bottom: 32, left: 80 }}>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
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
                    <div style={{
                        position:      "absolute",
                        top:           "50%",
                        left:          "50%",
                        transform:     "translate(-50%, -50%)",
                        textAlign:     "center",
                        pointerEvents: "none",
                    }}>
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
