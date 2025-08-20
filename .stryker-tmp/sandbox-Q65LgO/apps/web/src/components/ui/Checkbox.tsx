// @ts-nocheck
import React from "react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className={["inline-flex items-center gap-2", className].join(" ")}> 
      <input type="checkbox" className="h-4 w-4 border rounded" {...props} />
      {label ? <span className="text-sm">{label}</span> : null}
    </label>
  );
}


