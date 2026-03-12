"use client";

import { useState } from "react";
import { X, CalendarDays, ChevronDown, ChevronRight } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, LETTER_SPACING, RADIUS, SPACING,
    TRANSITIONS, Z_INDEX,
} from "@/lib/theme";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const YEARS = [2025, 2026];

const now          = new Date();
const currentYear  = now.getFullYear();
const currentMonth = now.getMonth();

interface SidebarProps {
    open: boolean;
    onToggle: () => void;
    selectedYear: number;
    selectedMonth: number;
    onMonthSelect: (year: number, month: number) => void;
}

export default function Sidebar({ open, onToggle, selectedYear, selectedMonth, onMonthSelect }: SidebarProps) {
    const [expandedYears, setExpandedYears] = useState<number[]>([currentYear]);

    function toggleYear(year: number) {
        setExpandedYears(prev =>
            prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
        );
    }

    return (
        <>
            {/* Overlay */}
            {open && (
                <div
                    onClick={onToggle}
                    style={{
                        position:       "fixed",
                        inset:           0,
                        background:     "rgba(0,0,0,0.4)",
                        zIndex:          Z_INDEX.overlay,
                        backdropFilter: "blur(2px)",
                    }}
                />
            )}

            {/* Panel */}
            <div style={{
                position:    "fixed",
                top:          0,
                right:        0,
                height:      "100vh",
                width:        280,
                background:   COLORS.card,
                borderLeft:  `1px solid ${COLORS.cardBorder}`,
                zIndex:       Z_INDEX.panel,
                transform:    open ? "translateX(0)" : "translateX(100%)",
                transition:  `transform ${TRANSITIONS.moderate} cubic-bezier(0.4, 0, 0.2, 1)`,
                display:     "flex",
                flexDirection: "column",
                padding:      SPACING["6"],
                overflowY:   "auto",
            }}>
                {/* Header */}
                <div style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    marginBottom:   SPACING["7"],
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: SPACING["2"] }}>
                        <CalendarDays size={16} color={COLORS.accent} />
                        <span style={{
                            fontFamily: FONTS.heading,
                            fontWeight: FONT_WEIGHTS.bold,
                            fontSize:   FONT_SIZES.lg,
                            color:      COLORS.text,
                        }}>
                            Historial
                        </span>
                    </div>
                    <button
                        onClick={onToggle}
                        style={{
                            background:     "none",
                            border:         "none",
                            cursor:         "pointer",
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            padding:        SPACING["1"],
                            borderRadius:   RADIUS.md,
                        }}
                    >
                        <X size={18} color={COLORS.muted} />
                    </button>
                </div>

                {/* Años y meses */}
                <div style={{ display: "flex", flexDirection: "column", gap: SPACING["2"] }}>
                    {YEARS.map(year => {
                        const isExpanded = expandedYears.includes(year);
                        return (
                            <div key={year}>
                                <button
                                    onClick={() => toggleYear(year)}
                                    style={{
                                        width:          "100%",
                                        display:        "flex",
                                        alignItems:     "center",
                                        justifyContent: "space-between",
                                        background:     "none",
                                        border:         "none",
                                        cursor:         "pointer",
                                        padding:        `${SPACING["2"]}px ${SPACING["2"] + 2}px`,
                                        borderRadius:   RADIUS.lg,
                                        marginBottom:   2,
                                        transition:     `background ${TRANSITIONS.fast}`,
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = COLORS.cardBorder + "80")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                    <span style={{
                                        fontFamily:    FONTS.heading,
                                        fontWeight:    FONT_WEIGHTS.bold,
                                        fontSize:      FONT_SIZES.body,
                                        color:         year === currentYear ? COLORS.accent : COLORS.muted,
                                        letterSpacing: LETTER_SPACING.normal,
                                    }}>
                                        {year}
                                    </span>
                                    {isExpanded
                                        ? <ChevronDown  size={15} color={COLORS.muted} />
                                        : <ChevronRight size={15} color={COLORS.muted} />
                                    }
                                </button>

                                {isExpanded && (
                                    <div style={{
                                        display:             "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap:                 6,
                                        paddingLeft:         SPACING["2"],
                                        paddingBottom:       SPACING["2"],
                                    }}>
                                        {MONTHS.map((month, idx) => {
                                            const isFuture  = year === currentYear && idx > currentMonth;
                                            const isSelected = selectedYear === year && selectedMonth === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    disabled={isFuture}
                                                    onClick={() => { onMonthSelect(year, idx); onToggle(); }}
                                                    style={{
                                                        padding:      `7px ${SPACING["2"] + 2}px`,
                                                        borderRadius: RADIUS.md,
                                                        border:       isSelected ? `1px solid ${COLORS.accent}66` : "1px solid transparent",
                                                        background:   isSelected ? COLORS.accent + "18" : "none",
                                                        color:        isFuture ? COLORS.cardBorder : isSelected ? COLORS.accent : COLORS.text,
                                                        fontSize:     FONT_SIZES.cap,
                                                        fontFamily:   FONTS.body,
                                                        fontWeight:   isSelected ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular,
                                                        cursor:       isFuture ? "default" : "pointer",
                                                        textAlign:    "left",
                                                        transition:   `background ${TRANSITIONS.fast}, color ${TRANSITIONS.fast}`,
                                                    }}
                                                    onMouseEnter={e => {
                                                        if (!isFuture && !isSelected)
                                                            e.currentTarget.style.background = COLORS.cardBorder + "60";
                                                    }}
                                                    onMouseLeave={e => {
                                                        if (!isSelected)
                                                            e.currentTarget.style.background = "none";
                                                    }}
                                                >
                                                    {month}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
