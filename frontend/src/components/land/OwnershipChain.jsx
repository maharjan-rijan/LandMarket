import { formatDate } from "@/lib/format";

// Owner A -> Owner B -> Owner C, newest at the bottom and marked as current.
export default function OwnershipChain({ chain }) {
  if (!chain?.length) return <p className="text-muted text-sm">No ownership record yet.</p>;

  return (
    <ol className="chain">
      {chain.map((c, i) => (
        <li key={`${c.owner}-${i}`} className={i === chain.length - 1 ? "is-current" : ""}>
          <p className="font-semibold">
            {c.owner} {i === chain.length - 1 && <span className="text-muted text-sm font-medium">(current owner)</span>}
          </p>
          <p className="text-muted text-sm">
            {formatDate(c.date)}, {c.note}
          </p>
        </li>
      ))}
    </ol>
  );
}
