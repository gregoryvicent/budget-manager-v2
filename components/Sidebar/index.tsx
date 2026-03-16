"use client";

import { useState } from "react";
import { X, CalendarDays, ChevronDown, ChevronRight } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, LETTER_SPACING, RADIUS, SPACING,
    TRANSITIONS, Z_INDEX,
} from "@/lib/theme";
import YearMonthGrid from "./YearMonthGrid";
import { SidebarProps } from "./types/SidebarProps";

const YEARS = [2025, 2026];

const now          = new Date();
const currentYear  = now.getFullYear();
const currentMonth = now.getMonth();

export default function Sidebar({ open, onToggle, selectedYear, selectedMonth, onMonthSelect }: SidebarProps) {
    const [expandedYears, setExpandedYears] = useState<number[]>([currentYear]);

    function toggleYear(year: number) {
        setExpandedYears(prev =>
            prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
        );
    }

    const handleMonthSelect = (year: number, month: number) => {
        onMonthSelect(year, month);
        onToggle();
    };

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
                position:      "fixed",
                top:            0,
                right:          0,
                height:        "100vh",
                width:          280,
                background:     COLORS.card,
                borderLeft:    `1px solid ${COLORS.cardBorder}`,
                zIndex:         Z_INDEX.panel,
                transform:      open ? "translateX(0)" : "translateX(100%)",
                transition:    `transform ${TRANSITIONS.moderate} cubic-bezier(0.4, 0, 0.2, 1)`,
                display:       "flex",
                flexDirection: "column",
                padding:        SPACING["6"],
                overflowY:     "auto",
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
                                        padding:        `${SPACING["2"]}px ${SPACING["2.5"]}px`,
                                        borderRadius:   RADIUS.lg,
                                        marginBottom:   SPACING["1"],
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
                                    <YearMonthGrid
                                        year={year}
                                        currentYear={currentYear}
                                        currentMonth={currentMonth}
                                        selectedYear={selectedYear}
                                        selectedMonth={selectedMonth}
                                        onSelect={handleMonthSelect}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
