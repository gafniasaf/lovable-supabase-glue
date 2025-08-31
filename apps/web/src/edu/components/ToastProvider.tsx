"use client";

import React from 'react';

type ToastApi = { show: (message: string) => void };
const ToastContext = React.createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = React.useState<string | null>(null);
  const api = React.useMemo<ToastApi>(() => ({ show: setMessage }), []);
  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Hidden live region to ensure screen readers announce */}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {/* host will render here */}
      </div>
    </ToastContext.Provider>
  );
}

export function ToastHost() {
  const [visible, setVisible] = React.useState(false);
  const [text, setText] = React.useState('');
  // subscribe to context messages via event pattern
  const ctx = React.useContext(ToastContext);
  React.useEffect(() => {
    if (!ctx) return;
    const original = ctx.show;
    (ctx as any).show = (msg: string) => {
      setText(msg);
      setVisible(true);
      setTimeout(() => setVisible(false), 1500);
      original(msg);
    };
    return () => {
      (ctx as any).show = original;
    };
  }, [ctx]);
  if (!visible) return null;
  return (
    <div role="status" className="fixed bottom-4 right-4 bg-black text-white rounded px-3 py-2 shadow">
      {text}
    </div>
  );
}


