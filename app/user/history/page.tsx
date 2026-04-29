"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import HistoryPageSkeleton from "@/components/HistoryPageSkeleton";
import { useBudgetHistory } from "@/hooks/useBudgetHistory";
import HistoryBarChart from "@/components/HistoryBarChart";
import YearFilter from "@/components/YearFilter";
import CurrencyProvider from "@/components/CurrencyProvider";
import {
  COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS,
  RADIUS, SPACING, TRANSITIONS,
} from "@/lib/theme";
import Tooltip from "@/components/Tooltip";

/**
 * Budget history page. Displays a bar chart with monthly income and expenses
 * for the selected year, along with a year filter and navigation back to the dashboard.
 */
export default function BudgetHistoryPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { chartData, availableYears, loading, error, retry } = useBudgetHistory(selectedYear);

  const hasData = chartData.some((d) => d.income > 0 || d.expenses > 0);

  return (
    <CurrencyProvider>
    <div
      className="min-h-screen p-4 lg:p-6 overflow-x-hidden box-border"
      style={{ background: COLORS.bg, fontFamily: FONTS.body }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      {/* Skeleton: loading with no cached data → full page skeleton */}
      {loading && !hasData && (
        <div role="status" aria-label="Cargando historial">
          <HistoryPageSkeleton />
        </div>
      )}

      {/* Normal page: not loading, or loading with cached data */}
      {(!loading || hasData) && (
        <>
          {/* Header */}
          <div className="flex flex-col items-start md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Tooltip label="Volver al dashboard">
                <Link
                  href="/user/dashboard"
                  aria-label="Volver al dashboard"
                  className="flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.xl,
                    background: COLORS.card,
                    border: `1px solid ${COLORS.cardBorder}`,
                    transition: `background ${TRANSITIONS.base}`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = COLORS.cardBorder)}
                  onMouseLeave={e => (e.currentTarget.style.background = COLORS.card)}
                >
                  <ArrowLeft size={18} color={COLORS.muted} />
                </Link>
              </Tooltip>
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.xl,
                    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.investment})`,
                  }}
                >
                  <BarChart3 size={20} color={COLORS.text} />
                </div>
                <h1
                  className="m-0 text-xl lg:text-[22px]"
                  style={{
                    fontWeight: FONT_WEIGHTS.extrabold,
                    fontFamily: FONTS.heading,
                    color: COLORS.text,
                    background: `linear-gradient(90deg, ${COLORS.text}, ${COLORS.accent})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Historial de Presupuesto
                </h1>
              </div>
            </div>
          </div>

          {/* Year filter */}
          <div style={{ marginBottom: SPACING["6"] }}>
            <YearFilter
              selectedYear={selectedYear}
              availableYears={availableYears}
              onChange={setSelectedYear}
            />
          </div>

          {/* Content */}
          <div
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: RADIUS.card,
              padding: SPACING["6"],
            }}
          >
            {!loading && error && (
              <div
                className="flex flex-col items-center justify-center gap-4"
                style={{ minHeight: 300 }}
                role="alert"
              >
                <p
                  style={{
                    color: COLORS.variable,
                    fontFamily: FONTS.body,
                    fontSize: FONT_SIZES.base,
                    margin: 0,
                  }}
                >
                  {error}
                </p>
                <button
                  onClick={retry}
                  className="cursor-pointer min-h-[44px] min-w-[44px]"
                  style={{
                    padding: `${SPACING["2"]}px ${SPACING["5"]}px`,
                    borderRadius: RADIUS.xl,
                    background: COLORS.accent + "22",
                    border: `1px solid ${COLORS.accent}44`,
                    color: COLORS.accent,
                    fontFamily: FONTS.heading,
                    fontWeight: FONT_WEIGHTS.semibold,
                    fontSize: FONT_SIZES.base,
                    transition: `all ${TRANSITIONS.base}`,
                  }}
                >
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && !hasData && (
              <div
                className="flex items-center justify-center"
                style={{ minHeight: 300 }}
              >
                <p
                  style={{
                    color: COLORS.muted,
                    fontFamily: FONTS.body,
                    fontSize: FONT_SIZES.base,
                    margin: 0,
                  }}
                >
                  No hay datos para este año
                </p>
              </div>
            )}

            {!error && hasData && (
              <HistoryBarChart data={chartData} />
            )}
          </div>
        </>
      )}
    </div>
    </CurrencyProvider>
  );
}
