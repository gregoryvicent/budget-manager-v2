"use client";

import { useState } from "react";
import { X, CalendarDays, ChevronDown, ChevronRight } from "lucide-react";
import { COLORS } from "@/lib/theme";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const YEARS = [2025, 2026];

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-indexed

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
            {/* Botón toggle */}
            <button
                onClick={onToggle}
                style={{
                    position: "fixed",
                    top: 24,
                    right: 24,
                    zIndex: 100,
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: COLORS.card,
                    border: `1px solid ${COLORS.cardBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = COLORS.cardBorder)}
                onMouseLeave={e => (e.currentTarget.style.background = COLORS.card)}
            >
                <CalendarDays size={18} color={COLORS.muted} />
            </button>

            {/* Overlay */}
            {open && (
                <div
                    onClick={onToggle}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        zIndex: 200,
                        backdropFilter: "blur(2px)",
                    }}
                />
            )}

            {/* Panel */}
            <div style={{
                position: "fixed",
                top: 0,
                right: 0,
                height: "100vh",
                width: 280,
                background: COLORS.card,
                borderLeft: `1px solid ${COLORS.cardBorder}`,
                zIndex: 300,
                transform: open ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                padding: 24,
                overflowY: "auto",
            }}>
                {/* Header */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 28,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CalendarDays size={16} color={COLORS.accent} />
                        <span style={{
                            fontFamily: "'Sora', sans-serif",
                            fontWeight: 700,
                            fontSize: 15,
                            color: COLORS.text,
                        }}>
                            Historial
                        </span>
                    </div>
                    <button
                        onClick={onToggle}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 4,
                            borderRadius: 8,
                        }}
                    >
                        <X size={18} color={COLORS.muted} />
                    </button>
                </div>

                {/* Años y meses */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {YEARS.map(year => {
                        const isExpanded = expandedYears.includes(year);
                        return (
                            <div key={year}>
                                {/* Header del año */}
                                <button
                                    onClick={() => toggleYear(year)}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "8px 10px",
                                        borderRadius: 10,
                                        marginBottom: 2,
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = COLORS.cardBorder + "80")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                    <span style={{
                                        fontFamily: "'Sora', sans-serif",
                                        fontWeight: 700,
                                        fontSize: 13,
                                        color: year === currentYear ? COLORS.accent : COLORS.muted,
                                        letterSpacing: "0.04em",
                                    }}>
                                        {year}
                                    </span>
                                    {isExpanded
                                        ? <ChevronDown size={15} color={COLORS.muted} />
                                        : <ChevronRight size={15} color={COLORS.muted} />
                                    }
                                </button>

                                {/* Meses */}
                                {isExpanded && (
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 6,
                                        paddingLeft: 8,
                                        paddingBottom: 8,
                                    }}>
                                        {MONTHS.map((month, idx) => {
                                            const isFuture = year === currentYear && idx > currentMonth;
                                            const isSelected = selectedYear === year && selectedMonth === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    disabled={isFuture}
                                                    onClick={() => { onMonthSelect(year, idx); onToggle(); }}
                                                    style={{
                                                        padding: "7px 10px",
                                                        borderRadius: 8,
                                                        border: isSelected
                                                            ? `1px solid ${COLORS.accent}66`
                                                            : "1px solid transparent",
                                                        background: isSelected
                                                            ? COLORS.accent + "18"
                                                            : "none",
                                                        color: isFuture
                                                            ? COLORS.cardBorder
                                                            : isSelected
                                                                ? COLORS.accent
                                                                : COLORS.text,
                                                        fontSize: 12,
                                                        fontFamily: "'DM Sans', sans-serif",
                                                        fontWeight: isSelected ? 600 : 400,
                                                        cursor: isFuture ? "default" : "pointer",
                                                        textAlign: "left",
                                                        transition: "background 0.15s, color 0.15s",
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
