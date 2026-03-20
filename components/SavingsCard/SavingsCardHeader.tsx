"use client";

import { useState, useEffect } from "react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING,
} from "@/lib/theme";
import { SavingsCardHeaderProps } from "./types/SavingsCardHeaderProps";

export default function SavingsCardHeader({
    title, color, icon: Icon, goalReached,
    allocationPct, onAllocationPctChange,
}: SavingsCardHeaderProps) {
    const [inputValue, setInputValue] = useState(String(allocationPct));

    useEffect(() => {
        setInputValue(String(allocationPct));
    }, [allocationPct]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        if (!/^\d*\.?\d*$/.test(raw)) return;
        if (raw !== "" && parseFloat(raw) > 100) return;
        setInputValue(raw);
    }

    function handleBlur() {
        const parsed = parseFloat(inputValue);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            onAllocationPctChange(parsed);
            setInputValue(String(parsed));
        } else {
            setInputValue(String(allocationPct));
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "."];
        if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
    }

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACING["2.5"] }}>
                <div style={{
                    background:   goalReached ? COLORS.goal + "25" : color + "20",
                    borderRadius: RADIUS.lg,
                    padding:      SPACING["2"],
                    border:       `1px solid ${goalReached ? COLORS.goal + "50" : color + "30"}`,
                }}>
                    <Icon size={16} color={goalReached ? COLORS.goal : color} />
                </div>
                <span style={{
                    color:      COLORS.text,
                    fontWeight: FONT_WEIGHTS.bold,
                    fontFamily: FONTS.heading,
                    fontSize:   FONT_SIZES.lg,
                }}>
                    {title}
                </span>
            </div>

            {/* % del ingreso editable */}
            <div style={{
                display:      "flex",
                alignItems:   "center",
                gap:          SPACING["1"],
                background:   color + "12",
                border:       `1px solid ${color}30`,
                borderRadius: RADIUS.lg,
                padding:      `${SPACING["1"]}px ${SPACING["2.5"]}px`,
            }}>
                <span style={{ color: COLORS.muted, fontSize: FONT_SIZES.xs, fontFamily: FONTS.body }}>
                    del ingreso
                </span>
                <input
                    type="number"
                    min={0} max={100} step={0.5}
                    value={inputValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    style={{
                        width:      38,
                        background: "transparent",
                        border:     "none",
                        color,
                        fontWeight: FONT_WEIGHTS.extrabold,
                        fontSize:   FONT_SIZES.base,
                        fontFamily: FONTS.heading,
                        textAlign:  "center",
                        padding:    0,
                        outline:    "none",
                    }}
                />
                <span style={{ color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, fontFamily: FONTS.heading }}>%</span>
            </div>
        </div>
    );
}
