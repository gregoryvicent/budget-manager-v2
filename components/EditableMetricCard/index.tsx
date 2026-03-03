"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import { Label, Value } from "@/components/Typography";

/**
 * Props for the EditableMetricCard component.
 */
interface EditableMetricCardProps {
  /** Label for the metric */
  label: string;
  /** Current value to display */
  value: number;
  /** Whether this is a percentage (true) or currency (false) */
  isPercentage: boolean;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * An editable metric card that allows users to modify values.
 * Displays formatted values and allows inline editing on click.
 *
 * @param {EditableMetricCardProps} props - The component props
 * @returns {JSX.Element} The rendered editable metric card
 * @example
 * <EditableMetricCard
 *   label="Monto a ahorrar"
 *   value={167.09}
 *   isPercentage={false}
 *   onChange={(val) => handleAmountChange(val)}
 * />
 */
export default function EditableMetricCard({
  label,
  value,
  isPercentage,
  onChange,
  className = "",
}: EditableMetricCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  // Update edit value when prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value.toFixed(2));
    }
  }, [value, isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    } else {
      setEditValue(value.toFixed(2));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(value.toFixed(2));
      setIsEditing(false);
    }
  };

  const formatDisplay = (val: number): string => {
    if (isPercentage) {
      return `${val.toFixed(2)}%`;
    }
    return `$${val.toFixed(2)}`;
  };

  return (
    <Card variant="default" className={`h-40 flex items-center ${className}`}>
      <div className="space-y-2 w-full">
        <Label className="text-charcoal/70 text-xs uppercase">{label}</Label>
        {isEditing ? (
          <input
            type="number"
            step="0.01"
            min="0"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full text-3xl font-bold text-charcoal bg-transparent border-b-2 border-sage focus:outline-none focus:border-sage-dark"
          />
        ) : (
          <div
            onClick={handleClick}
            className="cursor-pointer hover:bg-charcoal/5 rounded px-2 py-1 transition-colors"
          >
            <Value size="lg">{formatDisplay(value)}</Value>
          </div>
        )}
      </div>
    </Card>
  );
}
