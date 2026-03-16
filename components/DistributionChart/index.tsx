"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, CARD_STYLE, formatCurrency,
} from "@/lib/theme";
import { DistributionChartProps } from "./types/DistributionChartProps";
import { CustomLabelProps } from "./types/CustomLabelProps";
import { CustomTooltipProps } from "./types/CustomTooltipProps";

const RADIAN = Math.PI / 180;

function CustomLabel({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name = "", percent = 0, fill = "#fff" }: CustomLabelProps) {
    const pct      = (percent * 100).toFixed(1);
    const lineStart = outerRadius + 4;
    const sx = cx + lineStart * Math.cos(-midAngle * RADIAN);
    const sy = cy + lineStart * Math.sin(-midAngle * RADIAN);
    const mx = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
    const my = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
    const isRight = mx > cx;
    const ex = mx + (isRight ? 12 : -12);
    const ey = my;
    const textAnchor = isRight ? "start" : "end";

    return (
        <g>
            <path
                d={`M${sx},${sy} L${mx},${my} L${ex},${ey}`}
                stroke={fill} strokeWidth={1} fill="none" opacity={0.6}
            />
            <circle cx={ex} cy={ey} r={2} fill={fill} />
            <text
                x={ex + (isRight ? 5 : -5)} y={ey - 6}
                textAnchor={textAnchor}
                fill={COLORS.muted}
                fontSize={FONT_SIZES.xs}
                fontFamily={FONTS.body}
            >
                {name}
            </text>
            <text
                x={ex + (isRight ? 5 : -5)} y={ey + 6}
                textAnchor={textAnchor}
                fill={fill}
                fontSize={FONT_SIZES.sm}
                fontWeight={FONT_WEIGHTS.bold}
                fontFamily={FONTS.heading}
            >
                {pct}%
            </text>
        </g>
    );
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    const color: string = entry.payload?.color ?? COLORS.text;
    return (
        <div style={{
            background:  COLORS.cardBorder,
            border:      `1px solid ${color}44`,
            borderRadius: RADIUS.lg,
            padding:     `${SPACING["2"]}px 14px`,
            fontFamily:  FONTS.body,
        }}>
            <div style={{ color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.cap, marginBottom: 2, fontFamily: FONTS.heading }}>
                {entry.name}
            </div>
            <div style={{ color: COLORS.text, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold }}>
                {formatCurrency(entry.value)}
            </div>
        </div>
    );
}

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
