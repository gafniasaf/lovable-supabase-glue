// @ts-nocheck
"use client";
import React from "react";
import { useI18n } from "./I18nProvider";

export default function Trans({ keyPath, fallback }: { keyPath: string; fallback?: string }) {
  const { t } = useI18n();
  const text = t(keyPath);
  return <>{text || fallback || keyPath}</>;
}


