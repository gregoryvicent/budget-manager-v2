import ProgressRing from "@/components/ProgressRing";
import { COLORS, formatCurrency } from "@/lib/theme";

interface SavingsCardProps {
    title: string;
    saved: number;
    goal: number;
    color: string;
    icon: React.ElementType;
}

export default function SavingsCard({ title, saved, goal, color, icon: Icon }: SavingsCardProps) {
    const pct = goal > 0 ? Math.min((saved / goal) * 100, 100) : 0;

    return (
        <div style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: color + "22", borderRadius: 10, padding: 8 }}>
                    <Icon size={18} color={color} />
                </div>
                <span style={{ color: COLORS.text, fontWeight: 700, fontFamily: "'Sora', sans-serif", fontSize: 15 }}>
                    {title}
                </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ProgressRing pct={pct} color={color} size={90} stroke={9} />
                    <div style={{ position: "absolute", textAlign: "center" }}>
                        <div style={{ color, fontWeight: 800, fontSize: 14, fontFamily: "'Sora', sans-serif" }}>
                            {pct.toFixed(0)}%
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ color: COLORS.muted, fontSize: 11, fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>
                        Ahorrado
                    </div>
                    <div style={{ color: COLORS.text, fontWeight: 800, fontSize: 20, fontFamily: "'Sora', sans-serif" }}>
                        {formatCurrency(saved)}
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: 11, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                        Meta: {formatCurrency(goal)}
                    </div>
                    <div style={{ marginTop: 8, height: 4, borderRadius: 4, background: "#1f2937", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 1s ease" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
