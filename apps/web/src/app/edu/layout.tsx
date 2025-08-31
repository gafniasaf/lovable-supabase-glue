"use client";

import React from "react";
import { AppShell } from "@/edu/components/AppShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}


