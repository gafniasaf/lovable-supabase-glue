// @ts-nocheck
"use client";

import React, { useEffect } from "react";

export type GatewayProviderProps = {
  mode?: "test" | "http";
  children: React.ReactNode;
};

/**
 * GatewayProvider
 *
 * Lightweight client-only provider that toggles a runtime global
 * used by `isTestMode()` so gateways choose Test-vs-HTTP mode in
 * environments like Storybook without changing build-time env.
 */
export function GatewayProvider({ mode = "test", children }: GatewayProviderProps) {
  useEffect(() => {
    try {
      (window as any).__TEST_MODE__ = mode === "test";
    } catch {}
  }, [mode]);
  return <>{children}</>;
}


