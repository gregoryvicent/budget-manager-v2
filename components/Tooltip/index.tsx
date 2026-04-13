"use client";

import { useState, useRef, type ReactNode } from "react";
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, TRANSITIONS } from "@/lib/theme";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

/**
 * Lightweight tooltip that appears above the wrapped element on hover.
 *
 * @param {TooltipProps} props - Tooltip label and children to wrap.
 */
export default function Tooltip({ label, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setVisible(true), 300);
  };

  const hide = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setVisible(false);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            padding: `${SPACING["1"]}px ${SPACING["2.5"]}px`,
            borderRadius: RADIUS.md,
            background: COLORS.surface,
            border: `1px solid ${COLORS.cardBorder}`,
            color: COLORS.textDim,
            fontFamily: FONTS.body,
            fontSize: FONT_SIZES.cap,
            fontWeight: FONT_WEIGHTS.medium,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 50,
            opacity: 1,
            transition: `opacity ${TRANSITIONS.fast}`,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
