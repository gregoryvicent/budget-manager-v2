import { COLORS } from "@/lib/theme";

interface ProgressRingProps {
    pct: number;
    color: string;
    size?: number;
    stroke?: number;
    secondaryPct?: number;
    secondaryColor?: string;
}

export default function ProgressRing({
    pct,
    color,
    size = 80,
    stroke = 8,
    secondaryPct = 0,
    secondaryColor,
}: ProgressRingProps) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;

    const existingLen = (pct / 100) * circ;
    const monthlyLen = (secondaryPct / 100) * circ;
    const secondaryOffset = circ - existingLen;

    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            {/* Track */}
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.cardBorder} strokeWidth={stroke} />
            {/* Existing saved arc */}
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={`${existingLen} ${circ - existingLen}`}
                strokeDashoffset={0}
                strokeLinecap={secondaryPct > 0 ? "butt" : "round"}
                style={{ transition: "stroke-dasharray 1s ease" }}
            />
            {/* Monthly addition arc */}
            {secondaryPct > 0 && secondaryColor && (
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={secondaryColor} strokeWidth={stroke}
                    strokeDasharray={`${monthlyLen} ${circ - monthlyLen}`}
                    strokeDashoffset={secondaryOffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 1s ease" }}
                />
            )}
        </svg>
    );
}
