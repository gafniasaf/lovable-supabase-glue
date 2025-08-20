"use client";
import React, { useEffect } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);

export default function DirectionProviderClient() {
  const { locale } = useI18n();
  useEffect(() => {
    try {
      const isRtl = RTL_LOCALES.has(locale as string);
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    } catch {}
  }, [locale]);
  return null;
}


