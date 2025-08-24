"use client";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  id?: string;
};

export default function MuteToastsToggleClient({ id = "pref-mute-toasts", defaultChecked = false, ...rest }: Props) {
  const [checked, setChecked] = React.useState<boolean>(!!defaultChecked);

  React.useEffect(() => {
    try {
      const val = window.localStorage.getItem("notifications.muteToasts");
      if (val === "1") setChecked(true);
      if (val === "0") setChecked(false);
    } catch {}
  }, []);

  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => {
        setChecked(e.currentTarget.checked);
        try { window.localStorage.setItem("notifications.muteToasts", e.currentTarget.checked ? "1" : "0"); } catch {}
      }}
      {...rest}
    />
  );
}


