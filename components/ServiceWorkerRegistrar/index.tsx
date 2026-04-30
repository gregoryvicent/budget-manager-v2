"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on mount.
 * Renders nothing — drop it anywhere in the component tree.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("SW registration failed:", err);
      });
    }
  }, []);

  return null;
}
