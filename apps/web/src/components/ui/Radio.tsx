import React from "react";

type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Radio({ label, className = "", ...props }: RadioProps) {
  return (
    <label className={["inline-flex items-center gap-2", className].join(" ")}> 
      <input type="radio" className="h-4 w-4 border rounded-full" {...props} />
      {label ? <span className="text-sm">{label}</span> : null}
    </label>
  );
}


