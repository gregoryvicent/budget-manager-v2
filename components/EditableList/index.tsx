"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { COLORS, formatCurrency, type ListItem } from "@/lib/theme";

interface EditableListProps {
    title: string;
    items: ListItem[];
    color: string;
    icon: React.ElementType;
    onItemsChange: (items: ListItem[]) => void;
}

export default function EditableList({ title, items, color, icon: Icon, onItemsChange }: EditableListProps) {
    const [newName, setNewName] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [adding, setAdding] = useState(false);

    const total = items.reduce((s, i) => s + i.amount, 0);

    const addItem = () => {
        if (!newName || !newAmount) return;
        onItemsChange([...items, { id: Date.now(), name: newName, amount: parseFloat(newAmount) }]);
        setNewName("");
        setNewAmount("");
        setAdding(false);
    };

    const removeItem = (id: number) => onItemsChange(items.filter(i => i.id !== id));

    return (
        <div style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            height: 380,
        }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: color + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={18} color={color} />
                </div>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text }}>
                    {title}
                </span>
            </div>

            {/* Lista con scroll */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                paddingRight: 4,
            }}>
                {items.map(item => (
                    <div key={item.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 12px",
                        background: "#0f172a",
                        borderRadius: 10,
                        flexShrink: 0,
                        animation: "fadeIn 0.3s ease",
                    }}>
                        <span style={{ color: "#cbd5e1", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                            {item.name}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ color, fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif" }}>
                                {formatCurrency(item.amount)}
                            </span>
                            <button
                                onClick={() => removeItem(item.id)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563", padding: 2, transition: "color 0.2s" }}
                                onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"}
                                onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.color = "#4b5563"}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Botón añadir */}
            {adding ? (
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <input
                        placeholder="Nombre"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        style={{
                            flex: 2, padding: "8px 12px", borderRadius: 8,
                            background: "#0f172a", border: `1px solid ${color}44`,
                            color: COLORS.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                            outline: "none",
                        }}
                    />
                    <input
                        placeholder="Monto"
                        type="number"
                        value={newAmount}
                        onChange={e => setNewAmount(e.target.value)}
                        style={{
                            flex: 1, padding: "8px 12px", borderRadius: 8,
                            background: "#0f172a", border: `1px solid ${color}44`,
                            color: COLORS.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                            outline: "none",
                        }}
                    />
                    <button
                        onClick={addItem}
                        style={{
                            padding: "8px 14px", borderRadius: 8, border: "none",
                            background: color, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13,
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
                        padding: "8px 12px", borderRadius: 10, border: `1px dashed ${color}55`,
                        background: "none", color, cursor: "pointer", fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                    }}
                >
                    <Plus size={14} /> Añadir
                </button>
            )}

            {/* Total */}
            <div style={{
                paddingTop: 12, flexShrink: 0,
                borderTop: `1px solid ${COLORS.cardBorder}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <span style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Total</span>
                <span style={{ color, fontWeight: 800, fontSize: 18, fontFamily: "'Sora', sans-serif" }}>
                    {formatCurrency(total)}
                </span>
            </div>
        </div>
    );
}
