"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";
import type { AlertVariant } from "@/contexts/AlertContext";

/**
 * Props for the Alert component.
 */
export interface AlertProps {
  id: string;
  variant: AlertVariant;
  message: string;
  durationMs?: number;
  onDismiss: (id: string) => void;
}

const VARIANT_CONFIG: Record<
  AlertVariant,
  { icon: typeof CheckCircle; bg: string; border: string; text: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "bg-[#10b981]/10",
    border: "border-[#10b981]",
    text: "text-[#10b981]",
  },
  error: {
    icon: XCircle,
    bg: "bg-[#ef4444]/10",
    border: "border-[#ef4444]",
    text: "text-[#ef4444]",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-[#f59e0b]/10",
    border: "border-[#f59e0b]",
    text: "text-[#f59e0b]",
  },
};

/**
 * Reusable alert notification component with auto-dismiss and manual close.
 * Supports success, error, and warning variants with entry/exit animations.
 *
 * @param {AlertProps} props - Alert configuration
 */
export function Alert({
  id,
  variant,
  message,
  durationMs = 4000,
  onDismiss,
}: AlertProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  // Entry animation on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Auto-dismiss after durationMs
  useEffect(() => {
    if (durationMs <= 0) return;
    const timer = setTimeout(() => handleDismiss(), durationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs, id]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(id), 200);
  };

  return (
    <div
      role="alert"
      className={`
        pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3
        shadow-lg backdrop-blur-sm min-w-[300px] max-w-[420px]
        transition-all duration-200 ease-in-out
        ${config.bg} ${config.border}
        ${visible && !exiting ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
      `}
    >
      <Icon className={`${config.text} mt-0.5 shrink-0`} size={18} />
      <p className="flex-1 text-sm text-gray-200 leading-snug">{message}</p>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
        aria-label="Cerrar alerta"
      >
        <X size={16} />
      </button>
    </div>
  );
}
