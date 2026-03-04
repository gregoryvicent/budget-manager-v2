"use client";

import { useState } from "react";
import Card from "@/components/Card";
import { Heading, Label, Value } from "@/components/Typography";
import { formatCurrency } from "@/lib/formatters";
import type { ExpenseItem } from "@/components/ExpensesSection";

/**
 * Props for the EditableExpensesList component.
 */
interface EditableExpensesListProps {
  /** Title for the expenses section */
  title: string;
  /** Array of expense items to display */
  items: ExpenseItem[];
  /** Total expenses amount in USD */
  total: number;
  /** Type of expenses (fixed or variable) */
  type: "fixed" | "variable";
  /** Callback when items change */
  onItemsChange: (items: ExpenseItem[]) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Component for displaying and editing a list of expenses.
 * Allows adding, editing, and removing expense items.
 * Uses Card with expense variant for visual distinction.
 *
 * @param {EditableExpensesListProps} props - The component props
 * @returns {JSX.Element} The rendered editable expenses list
 * @example
 * <EditableExpensesList
 *   title="Gastos Mensuales Fijos"
 *   items={fixedExpenses}
 *   total={509.22}
 *   type="fixed"
 *   onItemsChange={(items) => setFixedExpenses(items)}
 * />
 */
export default function EditableExpensesList({
  title,
  items,
  total,
  type,
  onItemsChange,
  className = "",
}: EditableExpensesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const handleEdit = (item: ExpenseItem) => {
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
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name: "Nuevo Gasto",
      amount: 0,
      type,
    };
    onItemsChange([...items, newItem]);
    handleEdit(newItem);
  };

  return (
    <Card variant="expense" className={`h-full ${className}`}>
      <div className="flex flex-col h-full">
        <Heading level={2} className="mb-4">
          {title}
        </Heading>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 custom-scrollbar pr-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-2 px-3 rounded-lg transition-all duration-200 hover:bg-charcoal/5 dark:hover:bg-cream/5"
            >
              {editingId === item.id ? (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-charcoal/20 dark:border-cream/20 rounded text-sm text-charcoal dark:text-cream bg-cream dark:bg-charcoal/60"
                    placeholder="Nombre"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-24 px-2 py-1 border border-charcoal/20 dark:border-cream/20 rounded text-sm text-charcoal dark:text-cream bg-cream dark:bg-charcoal/60"
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
                    className="px-2 py-1 bg-charcoal/20 dark:bg-cream/20 text-charcoal dark:text-cream rounded text-xs hover:bg-charcoal/30 dark:hover:bg-cream/30"
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
                      className="px-2 py-1 text-xs text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 text-xs text-charcoal/60 dark:text-cream/60 hover:text-red-600"
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
            className="w-full py-2 px-3 border-2 border-dashed border-charcoal/20 dark:border-cream/20 rounded-lg text-charcoal/60 dark:text-cream/60 hover:border-sage hover:text-sage transition-all"
          >
            + Añadir Gasto
          </button>
        </div>

        <div className="pt-4 mt-4 border-t border-charcoal/20 dark:border-cream/20">
          <div className="flex justify-between items-center">
            <Heading level={3}>Total</Heading>
            <Value size="md">{formatCurrency(total)}</Value>
          </div>
        </div>
      </div>
    </Card>
  );
}
