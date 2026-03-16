import {
    COLORS, RADIUS, TRANSITIONS, ANIMATION_DURATIONS, PROGRESS_BAR_TRACK,
} from "@/lib/theme";
import { SavingsProgressBarProps } from "./types/SavingsProgressBarProps";

export default function SavingsProgressBar({ existingPct, monthlyPct, goalReached, color }: SavingsProgressBarProps) {
    return (
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
    );
}
