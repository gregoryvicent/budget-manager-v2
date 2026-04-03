"use client";

import { signOut } from "next-auth/react";
import { TrendingUp, TrendingDown, Wallet, CalendarDays, LogOut } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS,
    RADIUS, SPACING, TRANSITIONS,
} from "@/lib/theme";
import { DashboardHeaderProps } from "./types/DashboardHeaderProps";

export default function DashboardHeader({ afterExpenses, onToggleSidebar, selectedYear, selectedMonth, userName }: DashboardHeaderProps) {
    const monthLabel = new Date(selectedYear, selectedMonth - 1)
        .toLocaleDateString("es-CO", { month: "long", year: "numeric" });

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING["8"] }}>
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: SPACING["2.5"] }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: RADIUS.xl,
                        background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.investment})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Wallet size={20} color={COLORS.text} />
                    </div>
                    <h1 style={{
                        margin: 0,
                        fontSize:   FONT_SIZES["3xl"],
                        fontWeight: FONT_WEIGHTS.extrabold,
                        fontFamily: FONTS.heading,
                        color:      COLORS.text,
                        background: `linear-gradient(90deg, ${COLORS.text}, ${COLORS.accent})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor:  "transparent",
                    }}>
                        Hola, {userName}
                    </h1>
                </div>
                <p style={{
                    margin: "6px 0 0 50px",
                    fontSize:   FONT_SIZES.lg,
                    fontFamily: FONTS.heading,
                    fontWeight: FONT_WEIGHTS.semibold,
                    color:      COLORS.accent,
                    letterSpacing: "0.02em",
                }}>
                    Presupuesto de {monthLabel}
                </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: SPACING["2.5"] }}>
                <div style={{
                    padding:      `${SPACING["2.5"]}px ${SPACING["5"]}px`,
                    borderRadius: RADIUS.xl,
                    background:   afterExpenses >= 0 ? COLORS.income + "22" : COLORS.variable + "22",
                    border:       `1px solid ${afterExpenses >= 0 ? COLORS.income : COLORS.variable}44`,
                    display:      "flex", alignItems: "center", gap: SPACING["2"],
                }}>
                    {afterExpenses >= 0
                        ? <TrendingUp   size={16} color={COLORS.income}   />
                        : <TrendingDown size={16} color={COLORS.variable} />
                    }
                    <span style={{
                        color:      afterExpenses >= 0 ? COLORS.income : COLORS.variable,
                        fontWeight: FONT_WEIGHTS.bold,
                        fontFamily: FONTS.heading,
                        fontSize:   FONT_SIZES.base,
                    }}>
                        {afterExpenses >= 0 ? "Saldo positivo" : "Saldo negativo"}
                    </span>
                </div>
                <button
                    onClick={onToggleSidebar}
                    style={{
                        width:        40,
                        height:       40,
                        borderRadius: RADIUS.xl,
                        background:   COLORS.card,
                        border:       `1px solid ${COLORS.cardBorder}`,
                        display:      "flex", alignItems: "center", justifyContent: "center",
                        cursor:       "pointer",
                        transition:   `background ${TRANSITIONS.base}`,
                        flexShrink:   0,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = COLORS.cardBorder)}
                    onMouseLeave={e => (e.currentTarget.style.background = COLORS.card)}
                >
                    <CalendarDays size={18} color={COLORS.muted} />
                </button>
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    aria-label="Log out"
                    style={{
                        width:        40,
                        height:       40,
                        borderRadius: RADIUS.xl,
                        background:   COLORS.card,
                        border:       `1px solid ${COLORS.cardBorder}`,
                        display:      "flex", alignItems: "center", justifyContent: "center",
                        cursor:       "pointer",
                        transition:   `background ${TRANSITIONS.base}`,
                        flexShrink:   0,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = COLORS.cardBorder)}
                    onMouseLeave={e => (e.currentTarget.style.background = COLORS.card)}
                >
                    <LogOut size={18} color={COLORS.muted} />
                </button>
            </div>
        </div>
    );
}
