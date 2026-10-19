import Button from "@/components/ui/Button";

// A row of toggle chips used as a filter.
// options: [{ value, label, count? }]
export default function ChipGroup({
  label,
  options,
  value,
  onChange,
  className = "",
}) {
  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`}
      role="group"
      aria-label={label}
    >
      {options.map((o) => (
        <Button
          key={o.value}
          variant="chip"
          active={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count != null && (
            <>
              {" "}
              <small className="num">{o.count}</small>
            </>
          )}
        </Button>
      ))}
    </div>
  );
}
