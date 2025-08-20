import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function NumberField({ className = "", ...props }: Props) {
  return <input type="number" className={["border rounded px-3 py-2 w-full focus-visible:outline-blue-600", className].join(" ")} {...props} />;
}


