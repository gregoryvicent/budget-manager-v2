"use client";

import React, { createContext, useCallback, useState } from "react";
import { Alert } from "@/components/Alert";

/**
 * Variant types for alert notifications.
 */
export type AlertVariant = "success" | "error" | "warning";

/**
 * Represents a single alert item in the alert stack.
 */
export interface AlertItem {
  id: string;
  variant: AlertVariant;
  message: string;
  durationMs?: number;
}

/**
 * Context value exposed by AlertContext.
 */
export interface AlertContextValue {
  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, "id">) => void;
  removeAlert: (id: string) => void;
}

export const AlertContext = createContext<AlertContextValue | null>(null);

/**
 * Provider that manages a stack of alert notifications.
 * Renders a fixed container in the top-right corner with vertical stacking.
 *
 * @param {object} props - Provider props
 * @param {React.ReactNode} props.children - Child components
 */
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const addAlert = useCallback((alert: Omit<AlertItem, "id">) => {
    const id = crypto.randomUUID();
    setAlerts((prev) => [...prev, { ...alert, id }]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        role="status"
      >
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            id={alert.id}
            variant={alert.variant}
            message={alert.message}
            durationMs={alert.durationMs}
            onDismiss={removeAlert}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}
