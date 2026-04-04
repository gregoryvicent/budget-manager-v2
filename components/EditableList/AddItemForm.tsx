import { Plus } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, TRANSITIONS,
} from "@/lib/theme";
import { AddItemFormProps } from "./types/AddItemFormProps";

/**
 * Form for adding new items to an EditableList.
 * Uses Tailwind responsive classes for layout (mobile-first).
 * Mobile: inputs stack vertically (flex-col w-full).
 * Tablet/Desktop: inputs in a row (md:flex-row).
 * All buttons meet 44x44px touch target minimum.
 *
 * @param {AddItemFormProps} props - Form state and callbacks
 */
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
                className="flex items-center gap-1.5 shrink-0 min-h-[44px] min-w-[44px] px-3 py-2 cursor-pointer"
                style={{
                    borderRadius: RADIUS.lg,
                    border: `1px dashed ${color}55`,
                    background: "none",
                    color,
                    fontSize: FONT_SIZES.body,
                    fontFamily: FONTS.body,
                    transition: `all ${TRANSITIONS.base}`,
                }}
            >
                <Plus size={14} /> Añadir
            </button>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-2 shrink-0 w-full">
            <input
                placeholder="Nombre"
                value={newName}
                onChange={e => onNewNameChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full md:flex-2 min-h-[44px] px-3 py-2"
                style={{
                    borderRadius: RADIUS.md,
                    background: COLORS.surface,
                    border: `1px solid ${color}44`,
                    color: COLORS.text,
                    fontSize: FONT_SIZES.body,
                    fontFamily: FONTS.body,
                    outline: "none",
                }}
            />
            <input
                placeholder="Monto"
                type="number"
                value={newAmount}
                onChange={e => onNewAmountChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full md:flex-1 min-h-[44px] px-3 py-2"
                style={{
                    borderRadius: RADIUS.md,
                    background: COLORS.surface,
                    border: `1px solid ${color}44`,
                    color: COLORS.text,
                    fontSize: FONT_SIZES.body,
                    fontFamily: FONTS.body,
                    outline: "none",
                }}
            />
            <button
                onClick={onAdd}
                className="min-h-[44px] min-w-[44px] px-3.5 py-2 cursor-pointer"
                style={{
                    borderRadius: RADIUS.md,
                    border: "none",
                    background: color,
                    color: COLORS.text,
                    fontWeight: FONT_WEIGHTS.semibold,
                    fontSize: FONT_SIZES.body,
                }}
            >
                OK
            </button>
        </div>
    );
}
