import { pageWindow } from "@/lib/pagination";
import Button from "@/components/ui/Button";

// Page controls for any list. Hidden when everything fits on one page.
// Spread the object that usePagination returns: <Pagination {...pager} noun="listings" />
export default function Pagination({ page, totalPages, total, from, to, onChange, noun = "results", className = "" }) {
  if (totalPages <= 1) return null;

  return (
    <nav className={`pager ${className}`} aria-label="Pagination">
      <p className="pager-summary" aria-live="polite">
        Showing <strong className="num">{from}-{to}</strong> of <strong className="num">{total}</strong> {noun}
      </p>

      <ul className="pager-list">
        <li>
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
            Previous
          </Button>
        </li>

        {pageWindow(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} className="pager-gap" aria-hidden="true">
              ...
            </li>
          ) : (
            <li key={p} className={p === page ? undefined : "pager-number"}>
              <Button
                variant="bare"
                className={`pager-btn${p === page ? " is-current" : ""}`}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onChange(p)}
              >
                {p}
              </Button>
            </li>
          ),
        )}

        <li className="pager-of" aria-hidden="true">
          Page {page} of {totalPages}
        </li>

        <li>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
            Next
          </Button>
        </li>
      </ul>
    </nav>
  );
}
