/*
  A small pill for an active filter, with a button to remove it.
    <FilterChip label="Bagmati" onRemove={() => ...} />
*/
export default function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-emerald-50 py-1 pl-3 pr-1 text-sm text-emerald-800">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <span aria-hidden="true">×</span>
      </button>
    </span>
  );
}
