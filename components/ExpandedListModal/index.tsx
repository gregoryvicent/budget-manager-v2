"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, TRANSITIONS,
    formatCurrency,
} from "@/lib/theme";
import type { ListItem } from "@/lib/types";
import Modal from "@/components/Modal";
import EditableListItem from "@/components/EditableList/EditableListItem";
import AddItemForm from "@/components/EditableList/AddItemForm";
import type { ExpandedListModalProps } from "./types/ExpandedListModalProps";

/**
 * Expanded modal view for managing income/expense entries with more space.
 * Reuses EditableListItem and AddItemForm from EditableList, wrapping them
 * inside the existing Modal component. CRUD logic mirrors EditableList.
 *
 * @param {ExpandedListModalProps} props - Modal configuration and CRUD callbacks
 */
export default function ExpandedListModal({
    open, onClose, title, items, color, icon: Icon,
    onAdd, onUpdate, onDelete,
    isCreating = false, isUpdating = false, isDeletingId = null,
    onCopyFromMonth, triggerRef,
}: ExpandedListModalProps) {
    const [newName, setNewName]       = useState("");
    const [newAmount, setNewAmount]   = useState("");
    const [adding, setAdding]         = useState(false);
    const [editingId, setEditingId]   = useState<string | null>(null);
    const [editName, setEditName]     = useState("");
    const [editAmount, setEditAmount] = useState("");

    const total = items.reduce((s, i) => s + i.amount, 0);

    const addItem = async () => {
        if (!newName || !newAmount) return;
        await onAdd(newName, parseFloat(newAmount));
        setNewName("");
        setNewAmount("");
        setAdding(false);
    };

    const removeItem = (id: string) => onDelete(id);

    const startEdit = (item: ListItem) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditAmount(String(item.amount));
    };

    const confirmEdit = async () => {
        const parsed = parseFloat(editAmount);
        if (!editName.trim() || isNaN(parsed) || parsed < 0) { cancelEdit(); return; }
        await onUpdate(editingId!, editName.trim(), parsed);
        setEditingId(null);
    };

    const cancelEdit = () => setEditingId(null);

    return (
        <Modal open={open} onClose={onClose} title={title} maxWidth="640px" triggerRef={triggerRef}>
            <div className="flex flex-col gap-3 w-[95vw] md:w-auto">
                {/* Copy button */}
                {onCopyFromMonth && (
                    <button
                        onClick={onCopyFromMonth}
                        className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 cursor-pointer"
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
                        <Copy size={14} /> Copiar
                    </button>
                )}

                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1" style={{ maxHeight: "50vh" }}>
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
                            isUpdating={isUpdating && editingId === item.id}
                            isDeleting={isDeletingId === item.id}
                        />
                    ))}
                </div>

                {/* Add item form */}
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
                    isCreating={isCreating}
                />

                {/* Total */}
                <div
                    className="flex justify-between items-center pt-3 shrink-0"
                    style={{ borderTop: `1px solid ${COLORS.cardBorder}` }}
                >
                    <span style={{ color: COLORS.muted, fontSize: FONT_SIZES.body, fontFamily: FONTS.body }}>Total</span>
                    <span style={{ color, fontWeight: FONT_WEIGHTS.extrabold, fontSize: FONT_SIZES["2xl"], fontFamily: FONTS.heading }}>
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>
        </Modal>
    );
}
