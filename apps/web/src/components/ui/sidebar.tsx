"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Button from './Button';
import { Menu, X } from 'lucide-react';

interface SidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  setOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  className = ""
}: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isOpen) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const setOpen = (open: boolean) => setIsOpen(open);

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, toggleSidebar, setOpen }}>
      <div className={className}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

interface SidebarTriggerProps {
  className?: string;
  'aria-label'?: string;
}

export function SidebarTrigger({ className = "", ...props }: SidebarTriggerProps) {
  const { toggleSidebar, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className={className}
      {...props}
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export function Sidebar({ children, className = "" }: SidebarProps) {
  const { isOpen, isMobile, setOpen } = useSidebar();

  if (isMobile && !isOpen) return null;

  return (
    <aside className={`${className} ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r' : ''}`}>
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Menu</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {children}
    </aside>
  );
}
