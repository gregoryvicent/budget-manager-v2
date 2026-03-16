import { Check, X, Trash2 } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, TRANSITIONS,
    formatCurrency,
} from "@/lib/theme";
import { EditableListItemProps } from "./types/EditableListItemProps";

export default function EditableListItem({
    item, color, isEditing,
    editName, editAmount, onEditNameChange, onEditAmountChange,
    onStartEdit, onConfirmEdit, onCancelEdit, onRemove,
}: EditableListItemProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter")  onConfirmEdit();
        if (e.key === "Escape") onCancelEdit();
    };

    const inputStyle = (flex: number): React.CSSProperties => ({
        flex,
        padding:      `${SPACING["1"]}px ${SPACING["2"]}px`,
        borderRadius: RADIUS.md,
        background:   COLORS.bg,
        border:       `1px solid ${color}55`,
        color:        COLORS.text,
        fontSize:     FONT_SIZES.body,
        fontFamily:   FONTS.body,
        outline:      "none",
        minWidth:     0,
    });

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: SPACING["2"],
            padding:      `${SPACING["2"]}px ${SPACING["3"]}px`,
            background:   COLORS.surface,
            borderRadius: RADIUS.lg,
            flexShrink:   0,
            animation:    "fadeIn 0.3s ease",
            border:       isEditing ? `1px solid ${color}44` : "1px solid transparent",
            transition:   `border-color ${TRANSITIONS.base}`,
        }}>
            {isEditing ? (
                <>
                    <input
                        autoFocus
                        value={editName}
                        onChange={e => onEditNameChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={inputStyle(2)}
                    />
                    <input
                        value={editAmount}
                        onChange={e => onEditAmountChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="number" min={0}
                        style={inputStyle(1)}
                    />
                    <button
                        onClick={onConfirmEdit}
                        style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.income, padding: SPACING["1"], flexShrink: 0 }}
                    >
                        <Check size={14} />
                    </button>
                    <button
                        onClick={onCancelEdit}
                        style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, padding: SPACING["1"], flexShrink: 0 }}
                    >
                        <X size={14} />
                    </button>
                </>
            ) : (
                <>
                    <span
                        onClick={onStartEdit}
                        style={{ color: COLORS.textDim, fontSize: FONT_SIZES.body, fontFamily: FONTS.body, flex: 1, cursor: "pointer" }}
                    >
                        {item.name}
                    </span>
                    <span
                        onClick={onStartEdit}
                        style={{ color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.base, fontFamily: FONTS.heading, cursor: "pointer", flexShrink: 0 }}
                    >
                        {formatCurrency(item.amount)}
                    </span>
                    <button
                        onClick={onRemove}
                        style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, padding: SPACING["1"], flexShrink: 0, transition: `color ${TRANSITIONS.base}` }}
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
