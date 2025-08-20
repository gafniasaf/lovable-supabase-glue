// @ts-nocheck
import React from "react";

type SwitchProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
};

export default function Switch({ checked = false, onChange, label }: SwitchProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="sr-only">{label || 'Toggle'}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={[
          'w-10 h-6 rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-gray-300'
        ].join(' ')}
      >
        <span
          className={[
            'block w-5 h-5 bg-white rounded-full transform transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          ].join(' ')}
        />
      </button>
      {label ? <span className="text-sm">{label}</span> : null}
    </label>
  );
}


