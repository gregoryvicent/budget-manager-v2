// ─── Colors ──────────────────────────────────────────────────────────────────

export const COLORS = {
    bg:          "#0a0f1e",
    card:        "#111827",
    surface:     "#0f172a",   // fondo de items dentro de una card
    cardBorder:  "#1f2937",
    income:      "#10b981",
    fixed:       "#f59e0b",
    variable:    "#ef4444",
    savings:     "#3b82f6",
    investment:  "#8b5cf6",
    accent:      "#06b6d4",
    text:        "#f9fafb",
    textDim:     "#cbd5e1",   // texto ligeramente atenuado
    muted:       "#6b7280",
    // Semánticos
    goal:        "#f59e0b",   // estado de meta alcanzada
    monthly:     "#10b981",   // aporte mensual (alias de income)
    deficit:     "#f43f5e",   // balance negativo
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const FONTS = {
    heading: "'Sora', sans-serif",
    body:    "'DM Sans', sans-serif",
} as const;

export const FONT_SIZES = {
    xxs:  9,   // etiquetas internas del ring
    xs:   10,  // labels uppercase
    sm:   11,  // captions, labels de gráficas
    cap:  12,  // texto secundario, meses sidebar
    body: 13,  // texto cuerpo, inputs
    base: 14,  // texto base/defecto
    lg:   15,  // títulos de tarjeta
    xl:   16,  // títulos de sección
    "2xl": 18, // totales de lista
    "3xl": 22, // valores KPI
    "4xl": 28, // valores display grandes
} as const;

export const FONT_WEIGHTS = {
    regular:   400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
} as const;

export const LINE_HEIGHTS = {
    tight:  1,
    snug:   1.1,
    normal: 1.4,
} as const;

export const LETTER_SPACING = {
    tight:  "0.03em",
    normal: "0.04em",
    wide:   "0.05em",
    wider:  "0.06em",
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const SPACING = {
    "1":  4,
    "2":  8,
    "3":  12,
    "4":  16,
    "5":  20,
    "6":  24,
    "7":  28,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────

export const RADIUS = {
    sm:   4,   // barras de progreso, chips pequeños
    md:   8,   // botones, inputs, contenedores pequeños
    lg:   10,  // cajas de ícono, badges
    xl:   12,  // elementos del header
    card: 16,  // tarjetas y paneles
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────────────────

export const Z_INDEX = {
    overlay: 200,
    panel:   300,
} as const;

// ─── Transiciones y animaciones ──────────────────────────────────────────────

export const TRANSITIONS = {
    fast:     "0.15s ease",
    base:     "0.2s ease",
    moderate: "0.3s ease",
    slow:     "1s ease",
} as const;

export const ANIMATION_DURATIONS = {
    number:   800,    // AnimatedNumber (ms)
    progress: "1s",
    shimmer:  "1.8s",
    glow:     "2.5s",
    pulse:    "1.8s",
    banner:   "0.4s",
} as const;

// ─── Estilos base reutilizables ───────────────────────────────────────────────

export const CARD_STYLE = {
    background:    COLORS.card,
    border:        `1px solid ${COLORS.cardBorder}`,
    borderRadius:  RADIUS.card,
    padding:       SPACING["6"],
    display:       "flex" as const,
    flexDirection: "column" as const,
};

export const ICON_BOX_STYLE = (color: string) => ({
    background:     color + "20",
    borderRadius:   RADIUS.lg,
    padding:        SPACING["2"],
    border:         `1px solid ${color}30`,
    display:        "flex" as const,
    alignItems:     "center" as const,
    justifyContent: "center" as const,
});

export const PROGRESS_BAR_TRACK: React.CSSProperties = {
    height:       6,
    borderRadius: RADIUS.sm,
    background:   COLORS.cardBorder,
    overflow:     "hidden",
    display:      "flex",
};

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ListItem = {
    id:     number;
    name:   string;
    amount: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatCurrency(val: number): string {
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Añade opacidad en hex a un color. e.g. withAlpha(COLORS.accent, "30") */
export function withAlpha(color: string, hex: string): string {
    return color + hex;
}
