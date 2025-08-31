"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <>{children}</>;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function DropdownMenuTrigger({ asChild, children, ...props }: DropdownMenuTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(DropdownMenuInternalContext);
  if (!ctx) return children as any;
  const { setOpen, isOpen } = ctx;
  return React.cloneElement(children as React.ReactElement, {
    onClick: () => setOpen(!isOpen),
    ...props
  });
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
}

export function DropdownMenuContent({ children, align = 'start', className }: DropdownMenuContentProps) {
  const { isOpen, setOpen, contentRef } = React.useContext(DropdownMenuInternalContext)!;
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setOpen, contentRef]);
  if (!isOpen) return null;
  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        align === 'end' && "right-0",
        align === 'center' && "left-1/2 -translate-x-1/2",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DropdownMenuItem({ children, onClick, className }: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuInternalContext)!;
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={() => { onClick?.(); setOpen(false); }}
    >
      {children}
    </div>
  );
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
      {children}
    </div>
  );
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
    />
  );
}

type Ctx = { isOpen: boolean; setOpen: (v: boolean) => void; contentRef: React.RefObject<HTMLDivElement> };
const DropdownMenuInternalContext = React.createContext<Ctx | null>(null);
export function DropdownMenuRoot({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <DropdownMenuInternalContext.Provider value={{ isOpen, setOpen, contentRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuInternalContext.Provider>
  );
}
