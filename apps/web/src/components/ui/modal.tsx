"use client";

import React from 'react';

type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const ModalContext = React.createContext<Ctx | null>(null);

export function ModalRoot({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <ModalContext.Provider value={{ open, setOpen }}>{children}</ModalContext.Provider>;
}

export function ModalTrigger({ children }: { children: React.ReactElement }) {
  const ctx = React.useContext(ModalContext)!;
  return React.cloneElement(children, { onClick: () => ctx.setOpen(true) });
}

export function ModalClose({ children }: { children: React.ReactElement }) {
  const ctx = React.useContext(ModalContext)!;
  return React.cloneElement(children, { onClick: () => ctx.setOpen(false) });
}

export function ModalContent({ title, children }: { title: string; children: React.ReactNode }) {
  const ctx = React.useContext(ModalContext)!;
  if (!ctx.open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded shadow p-4 min-w-[280px]">
        {children}
      </div>
    </div>
  );
}


