"use client";

import ProgressRing from "@/components/ProgressRing";
import {
    COLORS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS,
    RADIUS, SPACING, ANIMATION_DURATIONS, CARD_STYLE,
} from "@/lib/theme";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import SavingsCardHeader from "./SavingsCardHeader";
import SavingsStats from "./SavingsStats";
import SavingsProgressBar from "./SavingsProgressBar";
import GoalBanner from "./GoalBanner";
import { SavingsCardProps } from "./types/SavingsCardProps";

/**
 * Displays a savings/investment goal card with progress ring, stats, and actions.
 * Responsive: vertical layout with smaller ring on mobile, horizontal on tablet+.
 *
 * @param {SavingsCardProps} props - Card configuration
 */
export default function SavingsCard({
    title, saved, goal, color, icon,
    allocationPct, monthlyAllocation, onAllocationPctChange, actions,
}: SavingsCardProps) {
    const isMobile = useMediaQuery("(max-width: 767px)");
    const ringSize = isMobile ? 80 : 96;

    const existingPct = goal > 0 ? Math.min((saved / goal) * 100, 100) : 0;
    const monthlyPct  = goal > 0 ? Math.min((monthlyAllocation / goal) * 100, 100 - existingPct) : 0;
    const remaining   = Math.max(goal - saved, 0);
    const goalReached = goal > 0 && saved >= goal;

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
                {/* Shimmer overlay when goal is reached */}
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

                {/* Body: ring + stats — vertical on mobile, horizontal on tablet+ */}
                <div className="flex flex-col items-center md:flex-row md:items-center gap-5">
                    <div className="relative shrink-0 flex items-center justify-center">
                        <ProgressRing
                            pct={goalReached ? 100 : existingPct}
                            color={goalReached ? COLORS.goal : color}
                            size={ringSize} stroke={8}
                            secondaryPct={goalReached ? 0 : monthlyPct}
                            secondaryColor={COLORS.monthly}
                        />
                        <div className="absolute text-center">
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

                {actions && (
                    <div
                        className="flex flex-wrap justify-end gap-2 pt-3 mt-1"
                        style={{ borderTop: `1px solid ${COLORS.cardBorder}` }}
                    >
                        {actions}
                    </div>
                )}
            </div>
        </>
    );
}
