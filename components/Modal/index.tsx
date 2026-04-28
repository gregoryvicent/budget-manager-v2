"use client";

import { useEffect, useCallback } from "react";
import { CARD_STYLE, COLORS, RADIUS, Z_INDEX, FONTS, FONT_SIZES, FONT_WEIGHTS, SPACING } from "@/lib/theme";
import type { ModalProps } from "./types/ModalProps";

/**
 * Reusable modal component with overlay, scroll lock, keyboard dismiss,
 * and focus return. All future modals should consume this component
 * instead of reimplementing overlay/close/accessibility logic.
 *
 * @param {ModalProps} props - Modal configuration props.
 * @returns {React.ReactElement | null} The rendered modal or null when closed.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "900px",
  triggerRef,
}: ModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  // Scroll lock + keyboard listener
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    const triggerEl = triggerRef?.current;

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKeyDown);
      triggerEl?.focus();
    };
  }, [open, handleKeyDown, triggerRef]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: Z_INDEX.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: `${COLORS.bg}cc`,
        }}
      />

      {/* Container */}
      <div
        className="w-[95%] md:w-[90%] p-4 md:p-6"
        style={{
          ...CARD_STYLE,
          padding: undefined,
          position: "relative",
          maxWidth,
          maxHeight: "85vh",
          overflowY: "auto",
          zIndex: Z_INDEX.panel,
          borderRadius: RADIUS.card,
          gap: SPACING["5"],
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              fontFamily: FONTS.heading,
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.text,
              margin: 0,
            }}
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: "transparent",
              border: "none",
              color: COLORS.muted,
              fontSize: FONT_SIZES["2xl"],
              cursor: "pointer",
              padding: SPACING["1"],
              lineHeight: 1,
              borderRadius: RADIUS.sm,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {children}
      </div>
    </div>
  );
}
