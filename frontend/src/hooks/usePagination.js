import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPageInfo } from "@/lib/pagination";

/*
  Splits a list into pages.

    const { items, pager } = usePagination(shown, { pageSize: 10, resetKey: filter });
    ...
    {items.map(...)}
    <Pagination {...pager} noun="listings" />

  options
    pageSize    rows per page (default 10)
    resetKey    when this value changes (a filter, a search word) the list goes back to page 1
    queryParam  keep the page in the address, for example "page" gives ?page=3, so the back
                button and shared links work. Without it the page is kept in memory only.
*/
export default function usePagination(list, { pageSize = 10, resetKey = "", queryParam } = {}) {
  const [params, setParams] = useSearchParams();
  const [localPage, setLocalPage] = useState(1);

  const wanted = queryParam ? params.get(queryParam) : localPage;
  const { page, totalPages, start, end, from, to } = getPageInfo(list.length, pageSize, wanted);

  const goTo = useCallback(
    (n) => {
      const next = Math.min(Math.max(1, n), totalPages);
      if (queryParam) {
        setParams(
          (prev) => {
            const p = new URLSearchParams(prev);
            if (next === 1) p.delete(queryParam);
            else p.set(queryParam, String(next));
            return p;
          },
          { replace: true },
        );
      } else {
        setLocalPage(next);
      }
    },
    [queryParam, setParams, totalPages],
  );

  // Back to page 1 when the filter or search changes (not on the first render, so a
  // ?page=3 link still opens on page 3).
  const goRef = useRef(goTo);
  goRef.current = goTo;
  const lastKey = useRef(resetKey);
  useEffect(() => {
    if (lastKey.current !== resetKey) {
      lastKey.current = resetKey;
      goRef.current(1);
    }
  }, [resetKey]);

  // A person turning the page starts reading from the top again.
  const onChange = useCallback(
    (n) => {
      goTo(n);
      const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
    },
    [goTo],
  );

  return {
    items: list.slice(start, end),
    pager: { page, totalPages, total: list.length, from, to, onChange },
  };
}
