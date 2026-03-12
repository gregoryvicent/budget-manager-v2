import { useState } from "react";
import ProgressRing from "@/components/ProgressRing";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, LETTER_SPACING,
    RADIUS, SPACING, TRANSITIONS, ANIMATION_DURATIONS, CARD_STYLE, PROGRESS_BAR_TRACK,
    formatCurrency,
} from "@/lib/theme";

interface SavingsCardProps {
    title: string;
    saved: number;
    goal: number;
    color: string;
    icon: React.ElementType;
    allocationPct: number;
    monthlyAllocation: number;
    onAllocationPctChange: (pct: number) => void;
}

export default function SavingsCard({
    title,
    saved,
    goal,
    color,
    icon: Icon,
    allocationPct,
    monthlyAllocation,
    onAllocationPctChange,
}: SavingsCardProps) {
    const [inputValue, setInputValue] = useState(String(allocationPct));

    const existingPct = goal > 0 ? Math.min((saved / goal) * 100, 100) : 0;
    const monthlyPct  = goal > 0 ? Math.min((monthlyAllocation / goal) * 100, 100 - existingPct) : 0;
    const remaining   = Math.max(goal - saved - monthlyAllocation, 0);
    const goalReached = goal > 0 && saved + monthlyAllocation >= goal;

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
        <>
            <style>{`
                @keyframes goalGlow {
                    0%, 100% { box-shadow: 0 0 12px ${COLORS.goal}44, 0 0 24px ${COLORS.goal}22; }
                    50%       { box-shadow: 0 0 20px ${COLORS.goal}88, 0 0 40px ${COLORS.goal}44; }
                }
                @keyframes goalBanner {
                    from { opacity: 0; transform: translateY(6px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
                @keyframes starPulse {
                    0%, 100% { transform: scale(1)   rotate(0deg); }
                    25%      { transform: scale(1.2) rotate(-8deg); }
                    75%      { transform: scale(1.2) rotate(8deg);  }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
            `}</style>
            <div style={{
                ...CARD_STYLE,
                gap:       SPACING["5"],
                border:    goalReached ? `1px solid ${COLORS.goal}88` : `1px solid ${COLORS.cardBorder}`,
                animation: goalReached ? `goalGlow ${ANIMATION_DURATIONS.glow} ease-in-out infinite` : undefined,
                position:  "relative",
                overflow:  "hidden",
            }}>
                {/* Shimmer overlay al alcanzar la meta */}
                {goalReached && (
                    <div style={{
                        position:   "absolute",
                        inset:       0,
                        background: `linear-gradient(105deg, transparent 40%, ${COLORS.goal}0a 50%, transparent 60%)`,
                        backgroundSize: "200% 100%",
                        animation:  `shimmer ${ANIMATION_DURATIONS.shimmer} linear infinite`,
                        pointerEvents: "none",
                        borderRadius:  RADIUS.card,
                    }} />
                )}

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: SPACING["2"] + 2 }}>
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
                        gap:          5,
                        background:   color + "12",
                        border:       `1px solid ${color}30`,
                        borderRadius: RADIUS.lg,
                        padding:      `5px ${SPACING["2"] + 2}px`,
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

                {/* Cuerpo: ring + datos */}
                <div style={{ display: "flex", alignItems: "center", gap: SPACING["5"] }}>
                    {/* Ring */}
                    <div style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ProgressRing
                            pct={goalReached ? 100 : existingPct}
                            color={goalReached ? COLORS.goal : color}
                            size={96} stroke={8}
                            secondaryPct={goalReached ? 0 : monthlyPct}
                            secondaryColor={COLORS.monthly}
                        />
                        <div style={{ position: "absolute", textAlign: "center" }}>
                            {goalReached ? (
                                <div style={{
                                    fontSize:  26,
                                    lineHeight: LINE_HEIGHTS.tight,
                                    animation: `starPulse ${ANIMATION_DURATIONS.pulse} ease-in-out infinite`,
                                    display:   "inline-block",
                                }}>
                                    🏆
                                </div>
                            ) : (
                                <>
                                    <div style={{ color, fontWeight: FONT_WEIGHTS.extrabold, fontSize: FONT_SIZES.lg, fontFamily: FONTS.heading, lineHeight: LINE_HEIGHTS.tight }}>
                                        {existingPct.toFixed(0)}%
                                    </div>
                                    <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xxs, fontFamily: FONTS.body, marginTop: 2 }}>
                                        meta
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: SPACING["3"] }}>
                        <div>
                            <div style={{
                                color:         COLORS.muted,
                                fontSize:      FONT_SIZES.xs,
                                fontFamily:    FONTS.body,
                                marginBottom:  1,
                                textTransform: "uppercase",
                                letterSpacing: LETTER_SPACING.wide,
                            }}>
                                Ahorrado
                            </div>
                            <div style={{ color: COLORS.text, fontWeight: FONT_WEIGHTS.extrabold, fontSize: FONT_SIZES["3xl"], fontFamily: FONTS.heading, lineHeight: LINE_HEIGHTS.snug }}>
                                {formatCurrency(saved)}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: SPACING["4"] }}>
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xs, fontFamily: FONTS.body, marginBottom: 1 }}>Meta</div>
                                <div style={{ color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body, fontFamily: FONTS.heading }}>
                                    {formatCurrency(goal)}
                                </div>
                            </div>
                            <div style={{ width: 1, background: COLORS.cardBorder }} />
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xs, fontFamily: FONTS.body, marginBottom: 1 }}>Mensual</div>
                                <div style={{ color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, fontFamily: FONTS.heading }}>
                                    {formatCurrency(monthlyAllocation)}
                                </div>
                            </div>
                            <div style={{ width: 1, background: COLORS.cardBorder }} />
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xs, fontFamily: FONTS.body, marginBottom: 1 }}>Restante</div>
                                <div style={{ color: goalReached ? COLORS.goal : COLORS.muted, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body, fontFamily: FONTS.heading }}>
                                    {goalReached ? "¡Listo!" : formatCurrency(remaining)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div style={{ ...PROGRESS_BAR_TRACK }}>
                    {goalReached ? (
                        <div style={{
                            height:         "100%",
                            width:          "100%",
                            background:     `linear-gradient(90deg, ${COLORS.goal}88, ${COLORS.goal}, #fcd34d, ${COLORS.goal})`,
                            backgroundSize: "200% 100%",
                            animation:      `shimmer ${ANIMATION_DURATIONS.shimmer} linear infinite`,
                            borderRadius:   RADIUS.sm,
                        }} />
                    ) : (
                        <>
                            <div style={{
                                height:       "100%",
                                width:        `${existingPct}%`,
                                background:   `linear-gradient(90deg, ${color}88, ${color})`,
                                transition:   `width ${TRANSITIONS.slow}`,
                                borderRadius: monthlyPct > 0 ? `${RADIUS.sm}px 0 0 ${RADIUS.sm}px` : RADIUS.sm,
                            }} />
                            {monthlyPct > 0 && (
                                <div style={{
                                    height:       "100%",
                                    width:        `${monthlyPct}%`,
                                    background:   `linear-gradient(90deg, ${COLORS.monthly}88, ${COLORS.monthly})`,
                                    transition:   `width ${TRANSITIONS.slow}`,
                                    borderRadius: `0 ${RADIUS.sm}px ${RADIUS.sm}px 0`,
                                }} />
                            )}
                        </>
                    )}
                </div>

                {/* Banner de meta alcanzada */}
                {goalReached && (
                    <div style={{
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        gap:             SPACING["2"],
                        padding:        `${SPACING["2"] + 2}px ${SPACING["4"]}px`,
                        borderRadius:   RADIUS.lg,
                        background:     `linear-gradient(135deg, ${COLORS.goal}18, ${COLORS.goal}08)`,
                        border:         `1px solid ${COLORS.goal}40`,
                        animation:      `goalBanner ${ANIMATION_DURATIONS.banner} ease forwards`,
                    }}>
                        <span style={{ fontSize: FONT_SIZES.lg }}>⭐</span>
                        <span style={{
                            color:         COLORS.goal,
                            fontWeight:    FONT_WEIGHTS.bold,
                            fontSize:      FONT_SIZES.body,
                            fontFamily:    FONTS.heading,
                            letterSpacing: LETTER_SPACING.tight,
                        }}>
                            ¡Meta alcanzada! Excelente trabajo.
                        </span>
                        <span style={{ fontSize: FONT_SIZES.lg }}>⭐</span>
                    </div>
                )}
            </div>
        </>
    );
}
