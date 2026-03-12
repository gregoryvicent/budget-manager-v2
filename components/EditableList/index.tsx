"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";
import {
    COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING,
    TRANSITIONS, CARD_STYLE, formatCurrency, type ListItem,
} from "@/lib/theme";

interface EditableListProps {
    title: string;
    items: ListItem[];
    color: string;
    icon: React.ElementType;
    onItemsChange: (items: ListItem[]) => void;
}

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

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter")  confirmEdit();
        if (e.key === "Escape") cancelEdit();
    };

    const inputStyle = (flex: number): React.CSSProperties => ({
        flex,
        padding:      `5px ${SPACING["2"]}px`,
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
        <div style={{ ...CARD_STYLE, gap: SPACING["3"], height: 380 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: SPACING["2"] + 2, flexShrink: 0 }}>
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
                    <div key={item.id} style={{
                        display: "flex", alignItems: "center", gap: SPACING["2"],
                        padding:      `${SPACING["2"]}px ${SPACING["3"]}px`,
                        background:   COLORS.surface,
                        borderRadius: RADIUS.lg,
                        flexShrink:   0,
                        animation:    "fadeIn 0.3s ease",
                        border:       editingId === item.id ? `1px solid ${color}44` : "1px solid transparent",
                        transition:   `border-color ${TRANSITIONS.base}`,
                    }}>
                        {editingId === item.id ? (
                            <>
                                <input
                                    autoFocus
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onKeyDown={handleEditKeyDown}
                                    style={inputStyle(2)}
                                />
                                <input
                                    value={editAmount}
                                    onChange={e => setEditAmount(e.target.value)}
                                    onKeyDown={handleEditKeyDown}
                                    type="number" min={0}
                                    style={inputStyle(1)}
                                />
                                <button
                                    onClick={confirmEdit}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.income, padding: 2, flexShrink: 0 }}
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, padding: 2, flexShrink: 0 }}
                                >
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <span
                                    onClick={() => startEdit(item)}
                                    style={{ color: COLORS.textDim, fontSize: FONT_SIZES.body, fontFamily: FONTS.body, flex: 1, cursor: "pointer" }}
                                >
                                    {item.name}
                                </span>
                                <span
                                    onClick={() => startEdit(item)}
                                    style={{ color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.base, fontFamily: FONTS.heading, cursor: "pointer", flexShrink: 0 }}
                                >
                                    {formatCurrency(item.amount)}
                                </span>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, padding: 2, flexShrink: 0, transition: `color ${TRANSITIONS.base}` }}
                                    onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.color = COLORS.variable}
                                    onMouseOut={e  => (e.currentTarget as HTMLButtonElement).style.color = COLORS.muted}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Botón añadir */}
            {adding ? (
                <div style={{ display: "flex", gap: SPACING["2"], flexShrink: 0 }}>
                    <input
                        placeholder="Nombre"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") addItem(); if (e.key === "Escape") setAdding(false); }}
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
                        onChange={e => setNewAmount(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") addItem(); if (e.key === "Escape") setAdding(false); }}
                        style={{
                            flex: 1, padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
                            borderRadius: RADIUS.md,
                            background: COLORS.surface, border: `1px solid ${color}44`,
                            color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body, outline: "none",
                        }}
                    />
                    <button
                        onClick={addItem}
                        style={{
                            padding: `${SPACING["2"]}px 14px`, borderRadius: RADIUS.md, border: "none",
                            background: color, color: "#fff", cursor: "pointer",
                            fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body,
                        }}
                    >
                        OK
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setAdding(true)}
                    style={{
                        display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                        padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
                        borderRadius: RADIUS.lg, border: `1px dashed ${color}55`,
                        background: "none", color, cursor: "pointer",
                        fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                        transition: `all ${TRANSITIONS.base}`,
                    }}
                >
                    <Plus size={14} /> Añadir
                </button>
            )}

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
