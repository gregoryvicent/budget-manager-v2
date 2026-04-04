import { Check, X, Trash2 } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, TRANSITIONS,
    formatCurrency,
} from "@/lib/theme";
import { EditableListItemProps } from "./types/EditableListItemProps";

/**
 * Single item row in an EditableList with inline editing support.
 * Uses Tailwind responsive classes for layout (mobile-first).
 * Text uses break-words to prevent horizontal overflow.
 * All action buttons meet 44x44px touch target minimum.
 *
 * @param {EditableListItemProps} props - Item data, edit state, and callbacks
 */
export default function EditableListItem({
    item, color, isEditing,
    editName, editAmount, onEditNameChange, onEditAmountChange,
    onStartEdit, onConfirmEdit, onCancelEdit, onRemove,
}: EditableListItemProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter")  onConfirmEdit();
        if (e.key === "Escape") onCancelEdit();
    };

    const inputBaseStyle: React.CSSProperties = {
        borderRadius: RADIUS.md,
        background:   COLORS.bg,
        border:       `1px solid ${color}55`,
        color:        COLORS.text,
        fontSize:     FONT_SIZES.body,
        fontFamily:   FONTS.body,
        outline:      "none",
    };

    return (
        <div
            className="flex items-center gap-2 px-3 py-2 shrink-0"
            style={{
                background:   COLORS.surface,
                borderRadius: RADIUS.lg,
                animation:    "fadeIn 0.3s ease",
                border:       isEditing ? `1px solid ${color}44` : "1px solid transparent",
                transition:   `border-color ${TRANSITIONS.base}`,
            }}
        >
            {isEditing ? (
                <>
                    <input
                        autoFocus
                        value={editName}
                        onChange={e => onEditNameChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-2 min-w-0 min-h-[44px] px-2 py-1"
                        style={inputBaseStyle}
                    />
                    <input
                        value={editAmount}
                        onChange={e => onEditAmountChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="number" min={0}
                        className="flex-1 min-w-0 min-h-[44px] px-2 py-1"
                        style={inputBaseStyle}
                    />
                    <button
                        onClick={onConfirmEdit}
                        className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                        style={{ background: "none", border: "none", color: COLORS.income, padding: 4 }}
                    >
                        <Check size={14} />
                    </button>
                    <button
                        onClick={onCancelEdit}
                        className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                        style={{ background: "none", border: "none", color: COLORS.muted, padding: 4 }}
                    >
                        <X size={14} />
                    </button>
                </>
            ) : (
                <>
                    <span
                        onClick={onStartEdit}
                        className="flex-1 break-words cursor-pointer"
                        style={{ color: COLORS.textDim, fontSize: FONT_SIZES.body, fontFamily: FONTS.body }}
                    >
                        {item.name}
                    </span>
                    <span
                        onClick={onStartEdit}
                        className="shrink-0 cursor-pointer"
                        style={{ color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.base, fontFamily: FONTS.heading }}
                    >
                        {formatCurrency(item.amount)}
                    </span>
                    <button
                        onClick={onRemove}
                        className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                        style={{
                            background: "none", border: "none", color: COLORS.muted,
                            padding: 4, transition: `color ${TRANSITIONS.base}`,
                        }}
                        onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.color = COLORS.variable}
                        onMouseOut={e  => (e.currentTarget as HTMLButtonElement).style.color = COLORS.muted}
                    >
                        <Trash2 size={14} />
                    </button>
                </>
            )}
        </div>
    );
}
