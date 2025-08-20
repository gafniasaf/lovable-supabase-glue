import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
	return <input className={["border rounded px-3 py-2 w-full focus-visible:outline-blue-600", className].join(" ")} {...props} />;
}


