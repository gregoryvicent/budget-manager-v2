"use client";

import { useState, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, SPACING, CARD_STYLE, RADIUS } from "@/lib/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import DetailModal from "@/components/DetailModal";
import type { DistributionChartProps } from "./types/DistributionChartProps";

const EMPTY_SLICE = [{ name: "", value: 1, color: COLORS.cardBorder }];

/**
 * Donut chart showing budget distribution by category with an interactive
 * legend. Hovering a slice highlights the legend row and vice-versa.
 * When breakdownData is provided, renders a "Más detalles" button that
 * opens a detail modal with per-category donut breakdowns.
 *
 * @param {DistributionChartProps} props - Chart data, totalIncome, and optional breakdownData
 */
export default function DistributionChart({ data, totalIncome, breakdownData }: DistributionChartProps) {
    const { formatAmount } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredName, setHoveredName] = useState<string | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const isMobile = useMediaQuery("(max-width: 767px)");

    const isEmpty = data.length === 0;
    const pieData = isEmpty ? EMPTY_SLICE : data;
    const sorted = isEmpty ? [] : [...data].sort((a, b) => b.value - a.value);
    const maxValue = sorted.length > 0 ? sorted[0].value : 0;

    const chartSize = isMobile ? 160 : 200;
    const outerRadius = isMobile ? 64 : 82;
    const innerRadius = isMobile ? 42 : 54;

    const handlePieEnter = useCallback((_: unknown, index: number) => {
        if (!isEmpty) setHoveredName(pieData[index].name);
    }, [isEmpty, pieData]);

    const handlePieLeave = useCallback(() => {
        setHoveredName(null);
    }, []);

    return (
        <div style={{ ...CARD_STYLE, height: "100%", justifyContent: "space-between" }}>
            <div style={{
                fontFamily: FONTS.heading,
                fontWeight: FONT_WEIGHTS.bold,
                fontSize: FONT_SIZES.base,
                color: COLORS.text,
                marginBottom: SPACING["2"],
            }}>
                Distribución
            </div>

            {isEmpty ? (
                <div style={{
                    color: COLORS.muted,
                    fontSize: FONT_SIZES.body,
                    fontFamily: FONTS.body,
                    padding: `${SPACING["6"]}px 0`,
                    textAlign: "center",
                }}>
                    Sin datos este mes
                </div>
            ) : (
                <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "center" : "flex-start",
                    gap: isMobile ? SPACING["4"] : SPACING["5"],
                }}>
                    {/* Donut with center total */}
                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {/* Mobile: total above the donut */}
                        {isMobile && (
                            <div style={{
                                fontFamily: FONTS.heading,
                                fontWeight: FONT_WEIGHTS.bold,
                                fontSize: FONT_SIZES.base,
                                color: COLORS.text,
                                marginBottom: SPACING["1"],
                            }}>
                                {formatAmount(totalIncome)}
                            </div>
                        )}
                        <div className="relative" style={{ width: chartSize, height: chartSize }}>
                            <ResponsiveContainer width={chartSize} height={chartSize}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={innerRadius}
                                        outerRadius={outerRadius}
                                        paddingAngle={3}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                        labelLine={false}
                                        label={false}
                                        onMouseEnter={handlePieEnter}
                                        onMouseLeave={handlePieLeave}
                                    >
                                        {pieData.map((item, i) => {
                                            const isActive = hoveredName === null || hoveredName === item.name;
                                            return (
                                                <Cell
                                                    key={i}
                                                    fill={item.color}
                                                    stroke="transparent"
                                                    opacity={isActive ? 1 : 0.3}
                                                    style={{ transition: "opacity 0.2s ease", cursor: "pointer" }}
                                                />
                                            );
                                        })}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center label — desktop only */}
                            {!isMobile && (
                                <div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
                                    style={{ width: innerRadius * 1.6 }}
                                >
                                    <div style={{
                                        fontFamily: FONTS.heading,
                                        fontWeight: FONT_WEIGHTS.bold,
                                        fontSize: FONT_SIZES.base,
                                        color: COLORS.text,
                                        lineHeight: 1.1,
                                    }}>
                                        {formatAmount(totalIncome)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legend with progress bars */}
                    <div style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: SPACING["1.5"],
                        width: isMobile ? "100%" : undefined,
                        minWidth: 0,
                    }}>
                        {sorted.map((item) => {
                            const pct = totalIncome > 0 ? ((item.value / totalIncome) * 100) : 0;
                            const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                            const isActive = hoveredName === null || hoveredName === item.name;
                            const isHighlighted = hoveredName === item.name;

                            return (
                                <div
                                    key={item.name}
                                    onMouseEnter={() => setHoveredName(item.name)}
                                    onMouseLeave={() => setHoveredName(null)}
                                    style={{
                                        minWidth: 0,
                                        padding: `${SPACING["1.5"]}px ${SPACING["2"]}px`,
                                        borderRadius: RADIUS.md,
                                        background: isHighlighted ? `${item.color}15` : "transparent",
                                        opacity: isActive ? 1 : 0.4,
                                        transition: "background 0.2s ease, opacity 0.2s ease",
                                        cursor: "pointer",
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "baseline",
                                        gap: SPACING["2"],
                                        marginBottom: 3,
                                    }}>
                                        <span style={{
                                            fontSize: FONT_SIZES.sm,
                                            fontFamily: FONTS.body,
                                            color: isHighlighted ? COLORS.text : COLORS.textDim,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            flex: 1,
                                            transition: "color 0.2s ease",
                                        }}>
                                            {item.name}
                                        </span>
                                        <span style={{
                                            fontSize: FONT_SIZES.sm,
                                            fontFamily: FONTS.heading,
                                            fontWeight: FONT_WEIGHTS.semibold,
                                            color: COLORS.text,
                                            whiteSpace: "nowrap",
                                        }}>
                                            {formatAmount(item.value)}
                                        </span>
                                        <span style={{
                                            fontSize: FONT_SIZES.xs,
                                            fontFamily: FONTS.heading,
                                            fontWeight: FONT_WEIGHTS.semibold,
                                            color: item.color,
                                            whiteSpace: "nowrap",
                                            minWidth: 40,
                                            textAlign: "right",
                                        }}>
                                            {pct.toFixed(1)}%
                                        </span>
                                    </div>
                                    {/* Progress bar */}
                                    <div style={{
                                        height: 4,
                                        borderRadius: RADIUS.sm,
                                        background: COLORS.cardBorder,
                                        overflow: "hidden",
                                    }}>
                                        <div style={{
                                            height: "100%",
                                            width: `${barWidth}%`,
                                            background: item.color,
                                            borderRadius: RADIUS.sm,
                                            transition: "width 0.3s ease",
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {breakdownData && (
                <>
                    <button
                        ref={buttonRef}
                        onClick={() => setIsModalOpen(true)}
                        disabled={isEmpty}
                        className="min-h-[44px]"
                        style={{
                            alignSelf: "center",
                            marginTop: SPACING["3"],
                            padding: `${SPACING["1.5"]}px ${SPACING["4"]}px`,
                            fontFamily: FONTS.body,
                            fontSize: FONT_SIZES.body,
                            fontWeight: FONT_WEIGHTS.medium,
                            color: isEmpty ? COLORS.muted : COLORS.accent,
                            background: "transparent",
                            border: `1px solid ${isEmpty ? COLORS.cardBorder : COLORS.accent}`,
                            borderRadius: RADIUS.md,
                            cursor: isEmpty ? "not-allowed" : "pointer",
                            opacity: isEmpty ? 0.5 : 1,
                        }}
                    >
                        Más detalles
                    </button>

                    <DetailModal
                        open={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        breakdownData={breakdownData}
                        triggerRef={buttonRef}
                    />
                </>
            )}
        </div>
    );
}
