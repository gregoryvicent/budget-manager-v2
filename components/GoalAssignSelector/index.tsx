"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2, Target } from "lucide-react";
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, TRANSITIONS, formatCurrency } from "@/lib/theme";
import type { SavingsGoalData } from "@/hooks/useSavingsGoals";

interface GoalAssignSelectorProps {
    /** Unassigned goals available for assignment. */
    goals: SavingsGoalData[];
    /** Callback when a goal is selected for assignment. */
    onAssign: (goalId: string) => Promise<void>;
    /** Whether an assign operation is in progress. */
    isAssigning: boolean;
    /** Accent color for styling. */
    color: string;
}

/**
 * Dropdown selector that displays unassigned goals and allows the user
 * to assign one to the current budget month.
 *
 * @param {GoalAssignSelectorProps} props - Component props.
 * @returns {JSX.Element} Rendered dropdown selector.
 */
export default function GoalAssignSelector({ goals, onAssign, isAssigning, color }: GoalAssignSelectorProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    if (goals.length === 0) {
        return (
            <button
                disabled
                className="flex items-center gap-1.5 min-h-[44px] cursor-not-allowed"
                style={{
                    background: "none",
                    border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: RADIUS.lg,
                    padding: "6px 12px",
                    color: COLORS.muted,
                    fontSize: FONT_SIZES.cap,
                    fontFamily: FONTS.body,
                    fontWeight: FONT_WEIGHTS.semibold,
                    opacity: 0.5,
                }}
            >
                <Target size={14} />
                Asignar existente
            </button>
        );
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                disabled={isAssigning}
                className="flex items-center gap-1.5 min-h-[44px] cursor-pointer"
                style={{
                    background: "none",
                    border: `1px solid ${color}44`,
                    borderRadius: RADIUS.lg,
                    padding: "6px 12px",
                    color,
                    fontSize: FONT_SIZES.cap,
                    fontFamily: FONTS.body,
                    fontWeight: FONT_WEIGHTS.semibold,
                    transition: `background ${TRANSITIONS.fast}`,
                    opacity: isAssigning ? 0.7 : 1,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = color + "18")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
                {isAssigning ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
                Asignar meta existente
                <ChevronDown size={12} style={{ transform: open ? "rotate(180deg)" : "none", transition: `transform ${TRANSITIONS.fast}` }} />
            </button>

            {open && (
                <div
                    className="absolute z-50 mt-2 w-[calc(100vw-2rem)] sm:w-64 max-h-60 overflow-y-auto right-0"
                    style={{
                        background: COLORS.card,
                        border: `1px solid ${COLORS.cardBorder}`,
                        borderRadius: RADIUS.card,
                        padding: 4,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}
                >
                    {goals.map(g => (
                        <button
                            key={g.id}
                            onClick={async () => {
                                setOpen(false);
                                await onAssign(g.id);
                            }}
                            disabled={isAssigning}
                            className="flex flex-col gap-0.5 w-full text-left min-h-[44px] cursor-pointer"
                            style={{
                                background: "none",
                                border: "none",
                                borderRadius: RADIUS.md,
                                padding: "8px 12px",
                                color: COLORS.text,
                                fontSize: FONT_SIZES.body,
                                fontFamily: FONTS.body,
                                transition: `background ${TRANSITIONS.fast}`,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = color + "18")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        >
                            <span style={{ fontWeight: FONT_WEIGHTS.medium }}>{g.title}</span>
                            <span style={{ color: COLORS.muted, fontSize: FONT_SIZES.cap }}>
                                Objetivo: {formatCurrency(g.goalAmount)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
