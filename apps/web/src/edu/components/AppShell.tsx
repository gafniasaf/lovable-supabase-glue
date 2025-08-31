"use client";

import React from "react";
import { Header } from "./Header";
import { ToastProvider, ToastHost } from "./ToastProvider";

export const AppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Header />
        {children}
        <ToastHost />
      </div>
    </ToastProvider>
  );
};


