// Pure helpers for pagination, kept apart from React so they are easy to test.

// Which page buttons to show. Always the first and last page and the current page with its
// neighbours; a gap of one page shows that page, a longer gap shows "gap".
// pageWindow(6, 20) -> [1, "gap", 5, 6, 7, "gap", 20]
export function pageWindow(page, totalPages) {
  const keep = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => keep.add(n)); // near the start: show a few more
  if (page >= totalPages - 2) [totalPages - 1, totalPages - 2, totalPages - 3].forEach((n) => keep.add(n));

  const sorted = [...keep].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1];
    if (prev && n - prev === 2) out.push(prev + 1);
    else if (prev && n - prev > 2) out.push("gap");
    out.push(n);
  });
  return out;
}

// Numbers for "Showing 11-20 of 57" and the slice to render.
export function getPageInfo(total, pageSize, wantedPage) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Math.floor(Number(wantedPage)) || 1), totalPages);
  const start = (page - 1) * pageSize;
  return {
    page,
    totalPages,
    start,
    end: start + pageSize,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}
