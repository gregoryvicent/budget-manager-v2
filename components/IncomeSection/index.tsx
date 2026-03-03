"use client";

import { useState } from "react";
import Card from "@/components/Card";
import { Heading, Label, Value } from "@/components/Typography";
import { formatCurrency } from "@/lib/formatters";

/**
 * Represents a single income item.
 */
export interface IncomeItem {
  /** Unique identifier for the income item */
  id: string;
  /** Name/description of the income source */
  name: string;
  /** Amount in USD */
  amount: number;
}

/**
 * Props for the IncomeSection component.
 */
interface IncomeSectionProps {
  /** Array of income items to display */
  items: IncomeItem[];
  /** Total income amount in USD */
  total: number;
  /** Callback when items change */
  onItemsChange: (items: IncomeItem[]) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Section component for displaying income sources.
 * Shows a list of income items with their amounts and a total.
 * Allows adding, editing, and removing items.
 * Uses Card with income variant for visual distinction.
 *
 * @param {IncomeSectionProps} props - The component props
 * @returns {JSX.Element} The rendered income section
 * @example
 * <IncomeSection
 *   items={[
 *     { id: '1', name: 'Salario', amount: 850.00 },
 *     { id: '2', name: 'Bono', amount: 50.00 }
 *   ]}
 *   total={900.00}
 *   onItemsChange={(items) => setIncomeItems(items)}
 * />
 */
export default function IncomeSection({
  items,
  total,
  onItemsChange,
  className = "",
}: IncomeSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const handleEdit = (item: IncomeItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditAmount(item.amount.toString());
  };

  const handleSave = (id: string) => {
    const amount = parseFloat(editAmount);
    if (editName.trim() && !isNaN(amount) && amount >= 0) {
      const updatedItems = items.map((item) =>
        item.id === id ? { ...item, name: editName, amount } : item
      );
      onItemsChange(updatedItems);
    }
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    onItemsChange(updatedItems);
  };

  const handleAdd = () => {
    const newItem: IncomeItem = {
      id: Date.now().toString(),
      name: "Nuevo Ingreso",
      amount: 0,
    };
    onItemsChange([...items, newItem]);
    handleEdit(newItem);
  };

  return (
    <Card variant="income" className={`h-full ${className}`}>
      <div className="flex flex-col h-full">
        <Heading level={2} className="mb-4">
          Fuentes de Ingresos
        </Heading>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 custom-scrollbar pr-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-2 px-3 rounded-lg transition-all duration-200 hover:bg-charcoal/5"
            >
              {editingId === item.id ? (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-charcoal/20 rounded text-sm text-charcoal bg-cream"
                    placeholder="Nombre"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-24 px-2 py-1 border border-charcoal/20 rounded text-sm text-charcoal bg-cream"
                    placeholder="Monto"
                  />
                  <button
                    onClick={() => handleSave(item.id)}
                    className="px-2 py-1 bg-sage text-cream rounded text-xs hover:bg-sage-dark"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-2 py-1 bg-charcoal/20 text-charcoal rounded text-xs hover:bg-charcoal/30"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <Label className="text-charcoal flex-1">{item.name}</Label>
                  <Value size="sm" className="mr-2">
                    {formatCurrency(item.amount)}
                  </Value>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-2 py-1 text-xs text-charcoal/60 hover:text-charcoal"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 text-xs text-charcoal/60 hover:text-red-600"
                    >
                      🗑
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          <button
            onClick={handleAdd}
            className="w-full py-2 px-3 border-2 border-dashed border-charcoal/20 rounded-lg text-charcoal/60 hover:border-sage hover:text-sage transition-all"
          >
            + Añadir Ingreso
          </button>
        </div>

        <div className="pt-4 mt-4 border-t border-charcoal/20">
          <div className="flex justify-between items-center">
            <Heading level={3}>Total</Heading>
            <Value size="md">{formatCurrency(total)}</Value>
          </div>
        </div>
      </div>
    </Card>
  );
}
