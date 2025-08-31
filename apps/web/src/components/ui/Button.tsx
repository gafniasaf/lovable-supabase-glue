"use client";

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const byVariant =
    variant === "primary"
      ? "bg-black text-white hover:bg-gray-800 focus-visible:outline-blue-600"
      : variant === "secondary"
      ? "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:outline-blue-600"
      : "bg-transparent text-gray-900 hover:bg-gray-100 focus-visible:outline-blue-600";

  const bySize =
    size === "sm"
      ? "h-8 px-3 text-sm"
      : size === "lg"
      ? "h-11 px-5 text-base"
      : "h-9 px-4 text-sm";

  return (
    <button className={[base, byVariant, bySize, className].join(" ")} {...props} />
  );
}


