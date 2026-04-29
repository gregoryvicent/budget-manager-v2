"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Calendar, CheckSquare, Square, Copy } from "lucide-react";
import Modal from "@/components/Modal";
import {
  useCopyItems,
  selectAllItems,
  deselectAllItems,
  initialSelection,
  computeSelectionSummary,
} from "@/hooks/useCopyItems";
import type { CopyCategory, CopyableItem } from "@/hooks/useCopyItems";
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SPACING,
  TRANSITIONS,
} from "@/lib/theme";
import { useCurrency } from "@/hooks/useCurrency";

/**
 * Props for the CopyItemsModal component.
 *
 * @param {boolean} open - Whether the modal is visible.
 * @param {() => void} onClose - Callback to close the modal.
 * @param {CopyCategory} category - The item category to copy.
 * @param {string} categoryLabel - Human-readable category name for the title.
 * @param {string} color - Theme color for the category.
 * @param {string} budgetMonthId - Target budget month ID.
 * @param {number} selectedYear - Target year.
 * @param {number} selectedMonth - Target month (1-12).
 * @param {() => void} onCopySuccess - Callback invoked after a successful copy.
 */
interface CopyItemsModalProps {
  open: boolean;
  onClose: () => void;
  category: CopyCategory;
  categoryLabel: string;
  color: string;
  budgetMonthId: string;
  selectedYear: number;
  selectedMonth: number;
  onCopySuccess: () => void;
}

/**
 * Modal component for copying budget items from a source month to the current month.
 * Phase 1: Select a source month from available months.
 * Phase 2: Select individual items to copy with checkboxes.
 *
 * @param {CopyItemsModalProps} props - Modal configuration props.
 * @returns {React.ReactElement} The rendered modal.
 */
export default function CopyItemsModal({
  open,
  onClose,
  category,
  categoryLabel,
  color,
  budgetMonthId,
  selectedYear,
  selectedMonth,
  onCopySuccess,
}: CopyItemsModalProps) {
  const {
    availableMonths,
    loadingMonths,
    sourceItems,
    loadingItems,
    isCopying,
    error,
    loadItemsForMonth,
    executeCopy,
    reset,
  } = useCopyItems(open ? budgetMonthId : null, selectedYear, selectedMonth, category);

  const { formatAmount } = useCurrency();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Preselect all items when source items load
  useEffect(() => {
    if (sourceItems.length > 0) {
      setSelectedIds(initialSelection(sourceItems));
    }
  }, [sourceItems]);

  const handleClose = useCallback(() => {
    if (isCopying) return;
    reset();
    setSelectedIds(new Set());
    setSelectedSourceId(null);
    onClose();
  }, [isCopying, reset, onClose]);

  const handleSelectMonth = useCallback(
    async (monthId: string) => {
      setSelectedSourceId(monthId);
      setSelectedIds(new Set());
      await loadItemsForMonth(monthId);
    },
    [loadItemsForMonth],
  );

  const handleBack = useCallback(() => {
    setSelectedSourceId(null);
    setSelectedIds(new Set());
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    if (selectedIds.size === sourceItems.length) {
      setSelectedIds(deselectAllItems());
    } else {
      setSelectedIds(selectAllItems(sourceItems));
    }
  }, [selectedIds.size, sourceItems]);

  const handleCopy = useCallback(async () => {
    const success = await executeCopy(Array.from(selectedIds));
    if (success) {
      reset();
      setSelectedIds(new Set());
      setSelectedSourceId(null);
      onCopySuccess();
      onClose();
    }
  }, [executeCopy, selectedIds, reset, onCopySuccess, onClose]);

  const { count, totalAmount } = computeSelectionSummary(sourceItems, selectedIds);
  const allSelected = sourceItems.length > 0 && selectedIds.size === sourceItems.length;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Copiar ${categoryLabel} de otro mes`}
      maxWidth="520px"
    >
      {/* Phase 1: Month selection */}
      {!selectedSourceId && (
        <MonthSelectionPhase
          availableMonths={availableMonths}
          loadingMonths={loadingMonths}
          error={error}
          color={color}
          onSelectMonth={handleSelectMonth}
          onClose={handleClose}
        />
      )}

      {/* Phase 2: Item selection */}
      {selectedSourceId && (
        <ItemSelectionPhase
          sourceItems={sourceItems}
          loadingItems={loadingItems}
          isCopying={isCopying}
          error={error}
          color={color}
          selectedIds={selectedIds}
          allSelected={allSelected}
          count={count}
          totalAmount={totalAmount}
          formatAmount={formatAmount}
          onToggleItem={toggleItem}
          onToggleAll={handleToggleAll}
          onBack={handleBack}
          onCopy={handleCopy}
        />
      )}
    </Modal>
  );
}

/* ─── Phase 1: Month Selection ─────────────────────────────────────────────── */

interface MonthSelectionPhaseProps {
  availableMonths: { budgetMonthId: string; label: string }[];
  loadingMonths: boolean;
  error: string | null;
  color: string;
  onSelectMonth: (id: string) => void;
  onClose: () => void;
}

function MonthSelectionPhase({
  availableMonths,
  loadingMonths,
  error,
  color,
  onSelectMonth,
  onClose,
}: MonthSelectionPhaseProps) {
  if (loadingMonths) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: SPACING["8"] }}>
        <Loader2 size={24} color={color} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: SPACING["6"] }}>
        <p style={{ color: COLORS.deficit, fontSize: FONT_SIZES.base, fontFamily: FONTS.body }}>
          {error}
        </p>
      </div>
    );
  }

  if (availableMonths.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: SPACING["6"], display: "flex", flexDirection: "column", gap: SPACING["4"], alignItems: "center" }}>
        <Calendar size={32} color={COLORS.muted} />
        <p style={{ color: COLORS.muted, fontSize: FONT_SIZES.base, fontFamily: FONTS.body, margin: 0 }}>
          No hay meses disponibles para copiar en esta categoría.
        </p>
        <button
          onClick={onClose}
          style={{
            background: COLORS.cardBorder,
            color: COLORS.text,
            border: "none",
            borderRadius: RADIUS.md,
            padding: `${SPACING["2.5"]}px ${SPACING["5"]}px`,
            fontSize: FONT_SIZES.base,
            fontFamily: FONTS.body,
            fontWeight: FONT_WEIGHTS.medium,
            cursor: "pointer",
            minHeight: 44,
            minWidth: 44,
            transition: `opacity ${TRANSITIONS.fast}`,
          }}
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SPACING["2"] }}>
      <p style={{ color: COLORS.textDim, fontSize: FONT_SIZES.body, fontFamily: FONTS.body, margin: 0 }}>
        Selecciona el mes del que deseas copiar:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: SPACING["1.5"], maxHeight: 300, overflowY: "auto" }}>
        {availableMonths.map((m) => (
          <MonthButton key={m.budgetMonthId} label={m.label} color={color} onClick={() => onSelectMonth(m.budgetMonthId)} />
        ))}
      </div>
    </div>
  );
}

function MonthButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: SPACING["3"],
        padding: `${SPACING["3"]}px ${SPACING["4"]}px`,
        background: hovered ? `${color}15` : COLORS.surface,
        border: `1px solid ${hovered ? `${color}40` : COLORS.cardBorder}`,
        borderRadius: RADIUS.md,
        cursor: "pointer",
        transition: `all ${TRANSITIONS.fast}`,
        minHeight: 44,
        width: "100%",
        textAlign: "left",
      }}
    >
      <Calendar size={16} color={color} />
      <span style={{ color: COLORS.text, fontSize: FONT_SIZES.base, fontFamily: FONTS.body, fontWeight: FONT_WEIGHTS.medium }}>
        {label}
      </span>
    </button>
  );
}

/* ─── Phase 2: Item Selection ──────────────────────────────────────────────── */

interface ItemSelectionPhaseProps {
  sourceItems: CopyableItem[];
  loadingItems: boolean;
  isCopying: boolean;
  error: string | null;
  color: string;
  selectedIds: Set<string>;
  allSelected: boolean;
  count: number;
  totalAmount: number;
  formatAmount: (amountUsd: number) => string;
  onToggleItem: (id: string) => void;
  onToggleAll: () => void;
  onBack: () => void;
  onCopy: () => void;
}

function ItemSelectionPhase({
  sourceItems,
  loadingItems,
  isCopying,
  error,
  color,
  selectedIds,
  allSelected,
  count,
  totalAmount,
  formatAmount,
  onToggleItem,
  onToggleAll,
  onBack,
  onCopy,
}: ItemSelectionPhaseProps) {
  if (loadingItems) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: SPACING["8"] }}>
        <Loader2 size={24} color={color} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && sourceItems.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: SPACING["6"] }}>
        <p style={{ color: COLORS.deficit, fontSize: FONT_SIZES.base, fontFamily: FONTS.body }}>
          {error}
        </p>
        <button
          onClick={onBack}
          style={{
            marginTop: SPACING["3"],
            background: COLORS.cardBorder,
            color: COLORS.text,
            border: "none",
            borderRadius: RADIUS.md,
            padding: `${SPACING["2.5"]}px ${SPACING["5"]}px`,
            fontSize: FONT_SIZES.base,
            fontFamily: FONTS.body,
            fontWeight: FONT_WEIGHTS.medium,
            cursor: "pointer",
            minHeight: 44,
            minWidth: 44,
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SPACING["3"] }}>
      {/* Back + Select all controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={onBack}
          disabled={isCopying}
          style={{
            background: "transparent",
            border: "none",
            color: COLORS.textDim,
            fontSize: FONT_SIZES.body,
            fontFamily: FONTS.body,
            cursor: isCopying ? "not-allowed" : "pointer",
            padding: `${SPACING["1"]}px ${SPACING["2"]}px`,
            minHeight: 44,
            minWidth: 44,
            opacity: isCopying ? 0.5 : 1,
          }}
        >
          ← Cambiar mes
        </button>
        <button
          onClick={onToggleAll}
          disabled={isCopying}
          style={{
            background: "transparent",
            border: "none",
            color,
            fontSize: FONT_SIZES.body,
            fontFamily: FONTS.body,
            fontWeight: FONT_WEIGHTS.medium,
            cursor: isCopying ? "not-allowed" : "pointer",
            padding: `${SPACING["1"]}px ${SPACING["2"]}px`,
            minHeight: 44,
            minWidth: 44,
            opacity: isCopying ? 0.5 : 1,
          }}
        >
          {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
        </button>
      </div>

      {/* Item list */}
      <div style={{ display: "flex", flexDirection: "column", gap: SPACING["1.5"], maxHeight: 260, overflowY: "auto" }}>
        {sourceItems.map((item) => (
          <ItemCheckbox
            key={item.id}
            item={item}
            checked={selectedIds.has(item.id)}
            color={color}
            disabled={isCopying}
            formatAmount={formatAmount}
            onToggle={() => onToggleItem(item.id)}
          />
        ))}
      </div>

      {/* Summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: `${SPACING["3"]}px 0`,
          borderTop: `1px solid ${COLORS.cardBorder}`,
        }}
      >
        <span style={{ color: COLORS.muted, fontSize: FONT_SIZES.body, fontFamily: FONTS.body }}>
          {count} ítem{count !== 1 ? "s" : ""} seleccionado{count !== 1 ? "s" : ""}
        </span>
        <span style={{ color, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.base, fontFamily: FONTS.heading }}>
          {formatAmount(totalAmount)}
        </span>
      </div>

      {/* Copy button */}
      <button
        onClick={onCopy}
        disabled={count === 0 || isCopying}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: SPACING["2"],
          width: "100%",
          padding: `${SPACING["3"]}px ${SPACING["5"]}px`,
          background: count === 0 || isCopying ? `${color}40` : color,
          color: COLORS.bg,
          border: "none",
          borderRadius: RADIUS.md,
          fontSize: FONT_SIZES.base,
          fontFamily: FONTS.body,
          fontWeight: FONT_WEIGHTS.semibold,
          cursor: count === 0 || isCopying ? "not-allowed" : "pointer",
          minHeight: 44,
          transition: `opacity ${TRANSITIONS.fast}`,
          opacity: count === 0 ? 0.5 : 1,
        }}
      >
        {isCopying ? (
          <>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            Copiando...
          </>
        ) : (
          <>
            <Copy size={16} />
            Copiar seleccionados
          </>
        )}
      </button>
    </div>
  );
}

/* ─── Item Checkbox ────────────────────────────────────────────────────────── */

interface ItemCheckboxProps {
  item: CopyableItem;
  checked: boolean;
  color: string;
  disabled: boolean;
  formatAmount: (amountUsd: number) => string;
  onToggle: () => void;
}

function ItemCheckbox({ item, checked, color, disabled, formatAmount, onToggle }: ItemCheckboxProps) {
  const [hovered, setHovered] = useState(false);
  const CheckIcon = checked ? CheckSquare : Square;

  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: SPACING["3"],
        padding: `${SPACING["2.5"]}px ${SPACING["3"]}px`,
        background: hovered && !disabled ? `${color}10` : COLORS.surface,
        border: `1px solid ${checked ? `${color}40` : COLORS.cardBorder}`,
        borderRadius: RADIUS.md,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: `all ${TRANSITIONS.fast}`,
        opacity: disabled ? 0.6 : 1,
        minHeight: 44,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        aria-label={`Seleccionar ${item.name}`}
      />
      <CheckIcon
        size={20}
        color={checked ? color : COLORS.muted}
        style={{ flexShrink: 0, minWidth: 20, minHeight: 20 }}
      />
      <span
        style={{
          flex: 1,
          color: COLORS.text,
          fontSize: FONT_SIZES.base,
          fontFamily: FONTS.body,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {item.name}
      </span>
      <span
        style={{
          color: COLORS.textDim,
          fontSize: FONT_SIZES.body,
          fontFamily: FONTS.body,
          fontWeight: FONT_WEIGHTS.medium,
          flexShrink: 0,
        }}
      >
        {formatAmount(item.amount)}
      </span>
    </label>
  );
}
