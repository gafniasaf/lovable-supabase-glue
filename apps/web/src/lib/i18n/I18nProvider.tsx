"use client";
import React from "react";
import en from "./messages/en";
import es from "./messages/es";

type Locale = "en" | "es";
type Messages = Record<string, unknown>;

const LOCALE_TO_MESSAGES: Record<Locale, Messages> = { en, es };

function getNestedMessage(messages: Messages, key: string): string | undefined {
  const parts = key.split(".");
  let current: any = messages;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as any)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

export type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  formatDate: (date: Date | number | string, opts?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (n: number, opts?: Intl.NumberFormatOptions) => string;
};

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined);

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return 'en';
    try {
      const stored = window.localStorage.getItem('lang') as Locale | null;
      const detected = document.documentElement.lang as Locale | '';
      return (stored || detected || 'en') as Locale;
    } catch {
      return 'en';
    }
  });

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      document.documentElement.lang = next;
      window.localStorage.setItem("lang", next);
    } catch {}
  }, []);

  const t = React.useCallback(
    (key: string, fallbackText?: string) => {
      const messages = LOCALE_TO_MESSAGES[locale] || en;
      const primary = getNestedMessage(messages, key);
      if (primary) return primary;
      const fallbackEn = getNestedMessage(en, key);
      return fallbackEn || (typeof fallbackText === 'string' ? fallbackText : undefined) || key;
    },
    [locale]
  );

  const formatDate = React.useCallback(
    (date: Date | number | string, opts?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, opts).format(new Date(date)),
    [locale]
  );

  const formatNumber = React.useCallback(
    (n: number, opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, opts).format(n),
    [locale]
  );

  const value = React.useMemo<I18nContextValue>(() => ({ locale, setLocale, t, formatDate, formatNumber }), [locale, setLocale, t, formatDate, formatNumber]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    // Provide a safe fallback if provider is missing
    return {
      locale: "en",
      setLocale: () => {},
      t: (k, fb) => getNestedMessage(en, k) || fb || k,
      formatDate: (d, opts) => new Intl.DateTimeFormat("en", opts).format(new Date(d)),
      formatNumber: (n, opts) => new Intl.NumberFormat("en", opts).format(n)
    };
  }
  return ctx;
}


