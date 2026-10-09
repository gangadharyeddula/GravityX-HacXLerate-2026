export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="card p-8 text-center">
      <div className="mb-4 text-3xl">📭</div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-5">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
