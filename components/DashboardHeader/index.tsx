"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet, CalendarDays, LogOut, BarChart3 } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS,
    RADIUS, SPACING, TRANSITIONS,
} from "@/lib/theme";
import { DashboardHeaderProps } from "./types/DashboardHeaderProps";
import Tooltip from "@/components/Tooltip";

/**
 * Dashboard header with greeting, month label, balance badge, and action buttons.
 * Responsive: vertical layout on mobile, horizontal on tablet+.
 * Badge text hidden on mobile (icon-only). Buttons meet 44px touch targets.
 *
 * @param {DashboardHeaderProps} props - Header configuration
 */
export default function DashboardHeader({ afterExpenses, onToggleSidebar, selectedYear, selectedMonth, userName }: DashboardHeaderProps) {
    const monthLabel = new Date(selectedYear, selectedMonth - 1)
        .toLocaleDateString("es-CO", { month: "long", year: "numeric" });

    return (
        <div className="flex flex-col items-start md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <div className="flex items-center gap-2.5">
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: 40, height: 40, borderRadius: RADIUS.xl,
                            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.investment})`,
                        }}
                    >
                        <Wallet size={20} color={COLORS.text} />
                    </div>
                    <h1
                        className="m-0 text-xl lg:text-[22px] truncate max-w-[60vw] md:max-w-none"
                        style={{
                            fontWeight: FONT_WEIGHTS.extrabold,
                            fontFamily: FONTS.heading,
                            color: COLORS.text,
                            background: `linear-gradient(90deg, ${COLORS.text}, ${COLORS.accent})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Hola, {userName}
                    </h1>
                </div>
                <p style={{
                    margin: "6px 0 0 50px",
                    fontSize: FONT_SIZES.lg,
                    fontFamily: FONTS.heading,
                    fontWeight: FONT_WEIGHTS.semibold,
                    color: COLORS.accent,
                    letterSpacing: "0.02em",
                }}>
                    Presupuesto de {monthLabel}
                </p>
            </div>

            <div className="flex items-center gap-2.5">
                {/* Balance badge — icon-only on mobile, full text on md+ */}
                <div
                    className="flex items-center gap-2"
                    style={{
                        padding: `${SPACING["2.5"]}px ${SPACING["5"]}px`,
                        borderRadius: RADIUS.xl,
                        background: afterExpenses >= 0 ? COLORS.income + "22" : COLORS.variable + "22",
                        border: `1px solid ${afterExpenses >= 0 ? COLORS.income : COLORS.variable}44`,
                    }}
                >
                    {afterExpenses >= 0
                        ? <TrendingUp   size={16} color={COLORS.income}   />
                        : <TrendingDown size={16} color={COLORS.variable} />
                    }
                    <span
                        className="hidden md:inline"
                        style={{
                            color: afterExpenses >= 0 ? COLORS.income : COLORS.variable,
                            fontWeight: FONT_WEIGHTS.bold,
                            fontFamily: FONTS.heading,
                            fontSize: FONT_SIZES.base,
                        }}
                    >
                        {afterExpenses >= 0 ? "Saldo positivo" : "Saldo negativo"}
                    </span>
                </div>
                <Tooltip label="Ver historial">
                    <Link
                        href="/user/history"
                        aria-label="Ver historial de presupuesto"
                        className="flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                        style={{
                            width: 44, height: 44,
                            borderRadius: RADIUS.xl,
                            background: COLORS.card,
                            border: `1px solid ${COLORS.cardBorder}`,
                            transition: `background ${TRANSITIONS.base}`,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = COLORS.cardBorder)}
                        onMouseLeave={e => (e.currentTarget.style.background = COLORS.card)}
                    >
                        <BarChart3 size={18} color={COLORS.muted} />
                    </Link>
                </Tooltip>
                <Tooltip label="Cambiar mes">
                    <button
                        onClick={onToggleSidebar}
                        className="flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] cursor-pointer"
                        style={{
                            width: 44, height: 44,
                            borderRadius: RADIUS.xl,
                            background: COLORS.card,
                            border: `1px solid ${COLORS.cardBorder}`,
                            transition: `background ${TRANSITIONS.base}`,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = COLORS.cardBorder)}
                        onMouseLeave={e => (e.currentTarget.style.background = COLORS.card)}
                    >
                        <CalendarDays size={18} color={COLORS.muted} />
                    </button>
                </Tooltip>
                <Tooltip label="Cerrar sesión">
                    <button
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        aria-label="Cerrar sesión"
                        className="flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] cursor-pointer"
                        style={{
                            width: 44, height: 44,
                            borderRadius: RADIUS.xl,
                            background: COLORS.card,
                            border: `1px solid ${COLORS.cardBorder}`,
                            transition: `background ${TRANSITIONS.base}`,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = COLORS.cardBorder)}
                        onMouseLeave={e => (e.currentTarget.style.background = COLORS.card)}
                    >
                        <LogOut size={18} color={COLORS.muted} />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
}
