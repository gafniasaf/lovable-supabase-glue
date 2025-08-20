import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options?: { value: string; label: string }[] };

export default function Select({ label, options, className = "", children, ...props }: Props) {
  return (
    <label className="inline-flex items-center gap-2">
      {label ? <span className="text-sm text-gray-700">{label}</span> : null}
      <select className={["border rounded px-2 py-1 text-sm", className].join(" ")} {...props}>
        {options ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>) : children}
      </select>
    </label>
  );
}


