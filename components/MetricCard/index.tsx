import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { COLORS } from "@/lib/theme";

interface MetricCardProps {
    label: string;
    value: React.ReactNode;
    color: string;
    icon: React.ElementType;
    subtitle?: string;
    trend?: "up" | "down";
}

export default function MetricCard({ label, value, color, icon: Icon, subtitle, trend }: MetricCardProps) {
    return (
        <div style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            position: "relative",
            overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", top: -20, right: -20,
                width: 80, height: 80, borderRadius: "50%",
                background: color + "15",
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{
                    color: COLORS.muted, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.05em", textTransform: "uppercase",
                }}>
                    {label}
                </span>
                <div style={{ background: color + "22", borderRadius: 8, padding: 6 }}>
                    <Icon size={16} color={color} />
                </div>
            </div>
            <div style={{ color: COLORS.text, fontWeight: 800, fontSize: 26, fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>
                {value}
            </div>
            {subtitle && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {trend === "up" && <ArrowUpRight size={14} color={COLORS.income} />}
                    {trend === "down" && <ArrowDownRight size={14} color={COLORS.variable} />}
                    <span style={{
                        color: trend === "up" ? COLORS.income : trend === "down" ? COLORS.variable : COLORS.muted,
                        fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                    }}>
                        {subtitle}
                    </span>
                </div>
            )}
        </div>
    );
}
