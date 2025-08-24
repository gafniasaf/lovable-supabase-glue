import "../../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // Do NOT render <html>/<body> here; root layout already provides them.
  // Keep this layout minimal so it only wraps /login content if needed.
  return <>{children}</>;
}


