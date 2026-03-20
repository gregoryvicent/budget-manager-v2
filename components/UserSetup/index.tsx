"use client";

import { useState } from "react";
import { User } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, CARD_STYLE,
} from "@/lib/theme";
import { UserSetupProps } from "./types/UserSetupProps";

export default function UserSetup({ onCreate }: UserSetupProps) {
    const [name, setName]     = useState("");
    const [email, setEmail]   = useState("");
    const [error, setError]   = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            setError("Nombre y email son requeridos.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await onCreate(name.trim(), email.trim());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear usuario.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: `${SPACING["3"]}px ${SPACING["4"]}px`,
        borderRadius: RADIUS.lg,
        background: COLORS.bg,
        border: `1px solid ${COLORS.cardBorder}`,
        color: COLORS.text,
        fontSize: FONT_SIZES.body,
        fontFamily: FONTS.body,
        outline: "none",
        boxSizing: "border-box",
    };

    return (
        <div style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100,
        }}>
            <div style={{
                ...CARD_STYLE,
                width: "100%", maxWidth: 420,
                gap: SPACING["5"],
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: SPACING["3"] }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: RADIUS.xl,
                        background: COLORS.accent + "22",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <User size={22} color={COLORS.accent} />
                    </div>
                    <div>
                        <div style={{ fontFamily: FONTS.heading, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES["2xl"], color: COLORS.text }}>
                            Bienvenido
                        </div>
                        <div style={{ fontFamily: FONTS.body, fontSize: FONT_SIZES.body, color: COLORS.muted }}>
                            Crea tu perfil para empezar
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: SPACING["3"] }}>
                    <input
                        style={inputStyle}
                        placeholder="Tu nombre"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={loading}
                    />
                    <input
                        style={inputStyle}
                        placeholder="Tu email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                    />

                    {error && (
                        <div style={{ color: COLORS.deficit, fontSize: FONT_SIZES.sm, fontFamily: FONTS.body }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: `${SPACING["3"]}px ${SPACING["4"]}px`,
                            borderRadius: RADIUS.lg,
                            background: COLORS.accent,
                            border: "none",
                            color: COLORS.text,
                            fontFamily: FONTS.heading,
                            fontWeight: FONT_WEIGHTS.bold,
                            fontSize: FONT_SIZES.body,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? "Creando..." : "Empezar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
