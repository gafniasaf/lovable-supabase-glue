import React from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextArea({ className = "", ...props }: Props) {
  return <textarea className={["border rounded px-3 py-2 w-full focus-visible:outline-blue-600", className].join(" ")} {...props} />;
}


