"use client";

import { useRef, useState } from "react";
import { X, CalendarDays, ChevronDown, ChevronRight } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, LETTER_SPACING, RADIUS,
    TRANSITIONS, Z_INDEX,
} from "@/lib/theme";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import YearMonthGrid from "./YearMonthGrid";
import { SidebarProps } from "./types/SidebarProps";

const YEARS = [2025, 2026];

const now          = new Date();
const currentYear  = now.getFullYear();

/**
 * Sidebar panel for month/year selection with swipe-to-close gesture support.
 *
 * @param {SidebarProps} props - Sidebar configuration and callbacks
 */
export default function Sidebar({ open, onToggle, selectedYear, selectedMonth, onMonthSelect }: SidebarProps) {
    const [expandedYears, setExpandedYears] = useState<number[]>([currentYear]);
    const panelRef = useRef<HTMLDivElement>(null);

    useSwipeGesture(panelRef, { onSwipeRight: onToggle, threshold: 50 });

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
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
                    style={{ zIndex: Z_INDEX.overlay }}
                />
            )}

            {/* Panel */}
            <div
                ref={panelRef}
                className="fixed top-0 right-0 h-screen w-[85vw] md:w-[280px] flex flex-col p-6 overflow-y-auto"
                style={{
                    background:     COLORS.card,
                    borderLeft:    `1px solid ${COLORS.cardBorder}`,
                    zIndex:         Z_INDEX.panel,
                    transform:      open ? "translateX(0)" : "translateX(100%)",
                    transition:    `transform ${TRANSITIONS.moderate} cubic-bezier(0.4, 0, 0.2, 1)`,
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-2">
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
                        className="flex items-center justify-center min-h-[44px] min-w-[44px] bg-transparent border-none cursor-pointer"
                        style={{ borderRadius: RADIUS.md }}
                    >
                        <X size={18} color={COLORS.muted} />
                    </button>
                </div>

                {/* Years and months */}
                <div className="flex flex-col gap-2">
                    {YEARS.map(year => {
                        const isExpanded = expandedYears.includes(year);
                        return (
                            <div key={year}>
                                <button
                                    onClick={() => toggleYear(year)}
                                    className="w-full flex items-center justify-between min-h-[44px] bg-transparent border-none cursor-pointer mb-1"
                                    style={{
                                        padding:        "8px 10px",
                                        borderRadius:   RADIUS.lg,
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
