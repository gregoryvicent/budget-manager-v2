"use client";

import ProgressRing from "@/components/ProgressRing";
import {
    COLORS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS,
    RADIUS, SPACING, ANIMATION_DURATIONS, CARD_STYLE,
} from "@/lib/theme";
import SavingsCardHeader from "./SavingsCardHeader";
import SavingsStats from "./SavingsStats";
import SavingsProgressBar from "./SavingsProgressBar";
import GoalBanner from "./GoalBanner";
import { SavingsCardProps } from "./types/SavingsCardProps";

export default function SavingsCard({
    title, saved, goal, color, icon,
    allocationPct, monthlyAllocation, onAllocationPctChange,
}: SavingsCardProps) {
    const existingPct = goal > 0 ? Math.min((saved / goal) * 100, 100) : 0;
    const monthlyPct  = goal > 0 ? Math.min((monthlyAllocation / goal) * 100, 100 - existingPct) : 0;
    const remaining   = Math.max(goal - saved - monthlyAllocation, 0);
    const goalReached = goal > 0 && saved + monthlyAllocation >= goal;

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
                        position:       "absolute",
                        inset:           0,
                        background:     `linear-gradient(105deg, transparent 40%, ${COLORS.goal}0a 50%, transparent 60%)`,
                        backgroundSize: "200% 100%",
                        animation:      `shimmer ${ANIMATION_DURATIONS.shimmer} linear infinite`,
                        pointerEvents:  "none",
                        borderRadius:   RADIUS.card,
                    }} />
                )}

                <SavingsCardHeader
                    title={title}
                    color={color}
                    icon={icon}
                    goalReached={goalReached}
                    allocationPct={allocationPct}
                    onAllocationPctChange={onAllocationPctChange}
                />

                {/* Cuerpo: ring + datos */}
                <div style={{ display: "flex", alignItems: "center", gap: SPACING["5"] }}>
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
                                    fontSize:   FONT_SIZES["4xl"],
                                    lineHeight: LINE_HEIGHTS.tight,
                                    animation:  `starPulse ${ANIMATION_DURATIONS.pulse} ease-in-out infinite`,
                                    display:    "inline-block",
                                }}>
                                    🏆
                                </div>
                            ) : (
                                <>
                                    <div style={{ color, fontWeight: FONT_WEIGHTS.extrabold, fontSize: FONT_SIZES.lg, fontFamily: COLORS.text, lineHeight: LINE_HEIGHTS.tight }}>
                                        {existingPct.toFixed(0)}%
                                    </div>
                                    <div style={{ color: COLORS.muted, fontSize: FONT_SIZES.xxs, marginTop: SPACING["1"] }}>
                                        meta
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <SavingsStats
                        saved={saved}
                        goal={goal}
                        monthlyAllocation={monthlyAllocation}
                        remaining={remaining}
                        goalReached={goalReached}
                        color={color}
                    />
                </div>

                <SavingsProgressBar
                    existingPct={existingPct}
                    monthlyPct={monthlyPct}
                    goalReached={goalReached}
                    color={color}
                />

                <GoalBanner visible={goalReached} />
            </div>
        </>
    );
}
