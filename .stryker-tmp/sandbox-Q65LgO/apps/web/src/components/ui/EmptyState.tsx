// @ts-nocheck
type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center border rounded p-8 text-sm">
      <div className="text-gray-900 font-medium">{title}</div>
      {description ? <div className="text-gray-500 mt-1">{description}</div> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}


