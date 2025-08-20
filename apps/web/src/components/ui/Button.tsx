"use client";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md" | "lg";
};

export default function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
	const base = "inline-flex items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";
	const byVariant = variant === "primary"
		? "bg-black text-white hover:bg-gray-800 focus-visible:outline-blue-600"
		: variant === "secondary"
		? "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:outline-blue-600"
		: "bg-transparent text-gray-900 hover:bg-gray-100 focus-visible:outline-blue-600";
	const bySize = size === "sm" ? "text-xs px-2 py-1" : size === "lg" ? "text-base px-5 py-3" : "text-sm px-3 py-2";
	return <button className={[base, byVariant, bySize, className].join(" ")} {...props} />;
}


