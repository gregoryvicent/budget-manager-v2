"use client";

import { useState } from "react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING,
    CARD_STYLE, formatCurrency,
} from "@/lib/theme";
import { type ListItem } from "@/lib/types";
import EditableListItem from "./EditableListItem";
import AddItemForm from "./AddItemForm";
import { EditableListProps } from "./types/EditableListProps";

export default function EditableList({ title, items, color, icon: Icon, onItemsChange }: EditableListProps) {
    const [newName, setNewName]       = useState("");
    const [newAmount, setNewAmount]   = useState("");
    const [adding, setAdding]         = useState(false);
    const [editingId, setEditingId]   = useState<number | null>(null);
    const [editName, setEditName]     = useState("");
    const [editAmount, setEditAmount] = useState("");

    const total = items.reduce((s, i) => s + i.amount, 0);

    const addItem = () => {
        if (!newName || !newAmount) return;
        onItemsChange([...items, { id: Date.now(), name: newName, amount: parseFloat(newAmount) }]);
        setNewName("");
        setNewAmount("");
        setAdding(false);
    };

    const removeItem = (id: number) => onItemsChange(items.filter(i => i.id !== id));

    const startEdit = (item: ListItem) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditAmount(String(item.amount));
    };

    const confirmEdit = () => {
        const parsed = parseFloat(editAmount);
        if (!editName.trim() || isNaN(parsed) || parsed < 0) { cancelEdit(); return; }
        onItemsChange(items.map(i => i.id === editingId ? { ...i, name: editName.trim(), amount: parsed } : i));
        setEditingId(null);
    };

    const cancelEdit = () => setEditingId(null);

    return (
        <div style={{ ...CARD_STYLE, gap: SPACING["3"], height: 380 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: SPACING["2.5"], flexShrink: 0 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: RADIUS.lg,
                    background: color + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={18} color={color} />
                </div>
                <span style={{
                    fontFamily: FONTS.heading,
                    fontWeight: FONT_WEIGHTS.bold,
                    fontSize:   FONT_SIZES.xl,
                    color:      COLORS.text,
                }}>
                    {title}
                </span>
            </div>

            {/* Lista con scroll */}
            <div style={{
                flex: 1, overflowY: "auto",
                display: "flex", flexDirection: "column",
                gap: SPACING["2"], paddingRight: SPACING["1"],
            }}>
                {items.map(item => (
                    <EditableListItem
                        key={item.id}
                        item={item}
                        color={color}
                        isEditing={editingId === item.id}
                        editName={editName}
                        editAmount={editAmount}
                        onEditNameChange={setEditName}
                        onEditAmountChange={setEditAmount}
                        onStartEdit={() => startEdit(item)}
                        onConfirmEdit={confirmEdit}
                        onCancelEdit={cancelEdit}
                        onRemove={() => removeItem(item.id)}
                    />
                ))}
            </div>

            <AddItemForm
                adding={adding}
                newName={newName}
                newAmount={newAmount}
                color={color}
                onNewNameChange={setNewName}
                onNewAmountChange={setNewAmount}
                onAdd={addItem}
                onStartAdding={() => setAdding(true)}
                onCancel={() => setAdding(false)}
            />

            {/* Total */}
            <div style={{
                paddingTop: SPACING["3"], flexShrink: 0,
                borderTop: `1px solid ${COLORS.cardBorder}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <span style={{ color: COLORS.muted, fontSize: FONT_SIZES.body, fontFamily: FONTS.body }}>Total</span>
                <span style={{ color, fontWeight: FONT_WEIGHTS.extrabold, fontSize: FONT_SIZES["2xl"], fontFamily: FONTS.heading }}>
                    {formatCurrency(total)}
                </span>
            </div>
        </div>
    );
}
