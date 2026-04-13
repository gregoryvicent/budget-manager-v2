"use client";

import {
  COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS,
  RADIUS, SPACING, TRANSITIONS,
} from "@/lib/theme";
import Tooltip from "@/components/Tooltip";

interface YearFilterProps {
  selectedYear: number;
  availableYears: number[];
  onChange: (year: number) => void;
}

/**
 * Year selector for the budget history page.
 * Displays available years as styled buttons, highlighting the active selection.
 * Falls back to showing only the selected year when no budget data exists yet.
 *
 * @param {YearFilterProps} props - Selected year, available years list, and change handler.
 */
export default function YearFilter({ selectedYear, availableYears, onChange }: YearFilterProps) {
  // Ensure the current selection is always visible even if not in availableYears
  const years = availableYears.length > 0
    ? (availableYears.includes(selectedYear) ? availableYears : [selectedYear, ...availableYears])
    : [selectedYear];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: SPACING["2"],
        alignItems: "center",
      }}
    >
      {years.map((year) => {
        const isActive = year === selectedYear;
        return (
          <Tooltip key={year} label={`Ver presupuesto ${year}`}>
            <button
              onClick={() => onChange(year)}
              aria-pressed={isActive}
              aria-label={`Filtrar por año ${year}`}
              className="cursor-pointer min-h-[44px] min-w-[44px]"
              style={{
                padding: `${SPACING["2"]}px ${SPACING["4"]}px`,
                borderRadius: RADIUS.xl,
                border: `1px solid ${isActive ? COLORS.accent : COLORS.cardBorder}`,
                background: isActive ? COLORS.accent + "22" : COLORS.card,
                color: isActive ? COLORS.accent : COLORS.muted,
                fontFamily: FONTS.heading,
                fontWeight: isActive ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium,
                fontSize: FONT_SIZES.base,
                transition: `all ${TRANSITIONS.base}`,
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = COLORS.cardBorder;
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = COLORS.card;
              }}
            >
              {year}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
