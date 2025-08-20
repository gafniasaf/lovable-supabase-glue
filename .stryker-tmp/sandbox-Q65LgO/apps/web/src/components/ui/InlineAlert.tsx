// @ts-nocheck
type InlineAlertProps = {
  kind?: "info" | "success" | "warning" | "error";
  title?: string;
  children?: React.ReactNode;
};

export default function InlineAlert({ kind = "info", title, children }: InlineAlertProps) {
  const base = "border rounded p-3 text-sm flex items-start gap-2";
  const kindClasses: Record<string, string> = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    success: "border-green-200 bg-green-50 text-green-900",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
    error: "border-red-200 bg-red-50 text-red-900",
  };
  const label: Record<string, string> = {
    info: "Information",
    success: "Success",
    warning: "Warning",
    error: "Error",
  };
  return (
    <div className={`${base} ${kindClasses[kind]}`} role="status" aria-live="polite">
      <div className="font-medium">{title ?? label[kind]}</div>
      {children ? <div className="text-sm">{children}</div> : null}
    </div>
  );
}


