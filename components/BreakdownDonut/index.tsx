"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, formatCurrency } from "@/lib/theme";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { BreakdownDonutProps } from "./types/BreakdownDonutProps";

const EMPTY_SLICE = [{ name: "", value: 1, color: COLORS.cardBorder }];

/**
 * Budget category breakdown card with donut chart and interactive legend.
 * Hovering a slice highlights the legend row and vice-versa.
 * Shows the category total in the donut center.
 *
 * @param {BreakdownDonutProps} props - Title, items, referenceTotal, emptyMessage
 */
export default function BreakdownDonut({ title, items, referenceTotal, emptyMessage }: BreakdownDonutProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const filtered = items.filter((item) => item.value !== 0);
  const sorted = [...filtered].sort((a, b) => b.value - a.value);
  const isEmpty = filtered.length === 0;
  const pieData = isEmpty ? EMPTY_SLICE : filtered;
  const categoryTotal = sorted.reduce((s, i) => s + i.value, 0);
  const maxValue = sorted.length > 0 ? sorted[0].value : 0;

  const chartSize = isMobile ? 140 : 160;
  const outerRadius = isMobile ? 54 : 64;
  const innerRadius = isMobile ? 36 : 43;

  const handlePieEnter = (_: unknown, index: number) => {
    if (!isEmpty) setHoveredName(pieData[index].name);
  };

  const handlePieLeave = () => {
    setHoveredName(null);
  };

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: RADIUS.card,
        padding: isMobile ? SPACING["4"] : SPACING["5"],
        display: "flex",
        flexDirection: "column",
        gap: SPACING["3"],
      }}
    >
      {/* Title */}
      <div style={{
        fontFamily: FONTS.heading,
        fontWeight: FONT_WEIGHTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.text,
      }}>
        {title}
      </div>

      {isEmpty ? (
        <div style={{
          color: COLORS.muted,
          fontSize: FONT_SIZES.body,
          fontFamily: FONTS.body,
          padding: `${SPACING["6"]}px 0`,
          textAlign: "center",
        }}>
          {emptyMessage}
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
                {formatCurrency(categoryTotal)}
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
                    paddingAngle={2}
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
                    {formatCurrency(categoryTotal)}
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
              const pct = referenceTotal > 0 ? ((item.value / referenceTotal) * 100) : 0;
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
                      {formatCurrency(item.value)}
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
    </div>
  );
}
