"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[FitX PWA] Service Worker registered cleanly:", reg.scope);
        })
        .catch((err) => {
          console.warn("[FitX PWA] Service Worker registration failed:", err);
        });
    }
  }, []);

  return null;
}
