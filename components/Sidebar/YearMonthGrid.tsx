import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, TRANSITIONS,
} from "@/lib/theme";
import { YearMonthGridProps } from "./types/YearMonthGridProps";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function YearMonthGrid({
    year, currentYear, currentMonth,
    selectedYear, selectedMonth, onSelect,
}: YearMonthGridProps) {
    return (
        <div style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1fr",
            gap:                 SPACING["1.5"],
            paddingLeft:         SPACING["2"],
            paddingBottom:       SPACING["2"],
        }}>
            {MONTHS.map((month, idx) => {
                const isFuture  = year === currentYear && idx > currentMonth;
                const isSelected = selectedYear === year && selectedMonth === idx;
                return (
                    <button
                        key={idx}
                        disabled={isFuture}
                        onClick={() => onSelect(year, idx)}
                        style={{
                            padding:      `${SPACING["2"]}px ${SPACING["2.5"]}px`,
                            borderRadius: RADIUS.md,
                            border:       isSelected ? `1px solid ${COLORS.accent}66` : "1px solid transparent",
                            background:   isSelected ? COLORS.accent + "18" : "none",
                            color:        isFuture ? COLORS.cardBorder : isSelected ? COLORS.accent : COLORS.text,
                            fontSize:     FONT_SIZES.cap,
                            fontFamily:   FONTS.body,
                            fontWeight:   isSelected ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular,
                            cursor:       isFuture ? "default" : "pointer",
                            textAlign:    "left",
                            transition:   `background ${TRANSITIONS.fast}, color ${TRANSITIONS.fast}`,
                        }}
                        onMouseEnter={e => {
                            if (!isFuture && !isSelected)
                                e.currentTarget.style.background = COLORS.cardBorder + "60";
                        }}
                        onMouseLeave={e => {
                            if (!isSelected)
                                e.currentTarget.style.background = "none";
                        }}
                    >
                        {month}
                    </button>
                );
            })}
        </div>
    );
}
