import { Plus } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, TRANSITIONS,
} from "@/lib/theme";
import { AddItemFormProps } from "./types/AddItemFormProps";

export default function AddItemForm({
    adding, newName, newAmount, color,
    onNewNameChange, onNewAmountChange, onAdd, onStartAdding, onCancel,
}: AddItemFormProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter")  onAdd();
        if (e.key === "Escape") onCancel();
    };

    if (!adding) {
        return (
            <button
                onClick={onStartAdding}
                style={{
                    display: "flex", alignItems: "center", gap: SPACING["1.5"], flexShrink: 0,
                    padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
                    borderRadius: RADIUS.lg, border: `1px dashed ${color}55`,
                    background: "none", color, cursor: "pointer",
                    fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                    transition: `all ${TRANSITIONS.base}`,
                }}
            >
                <Plus size={14} /> Añadir
            </button>
        );
    }

    return (
        <div style={{ display: "flex", gap: SPACING["2"], flexShrink: 0 }}>
            <input
                placeholder="Nombre"
                value={newName}
                onChange={e => onNewNameChange(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                    flex: 2, padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
                    borderRadius: RADIUS.md,
                    background: COLORS.surface, border: `1px solid ${color}44`,
                    color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body, outline: "none",
                }}
            />
            <input
                placeholder="Monto"
                type="number"
                value={newAmount}
                onChange={e => onNewAmountChange(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                    flex: 1, padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
                    borderRadius: RADIUS.md,
                    background: COLORS.surface, border: `1px solid ${color}44`,
                    color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body, outline: "none",
                }}
            />
            <button
                onClick={onAdd}
                style={{
                    padding: `${SPACING["2"]}px ${SPACING["3.5"]}px`, borderRadius: RADIUS.md, border: "none",
                    background: color, color: COLORS.text, cursor: "pointer",
                    fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body,
                }}
            >
                OK
            </button>
        </div>
    );
}
