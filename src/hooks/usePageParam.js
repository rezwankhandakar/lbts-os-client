// usePageParam — keeps the current page number in sync with the URL
// ?page=N search param. Survives refresh, back/forward navigation,
// and can be bookmarked or shared.
//
// Usage (replaces useState):
//   const [page, setPage] = usePageParam();      // default key = 'page'
//   const [page, setPage] = usePageParam('p');   // custom key, e.g. ?p=3
//
// setPage resets to 1 automatically when filters change — pass resetKeys:
//   const [page, setPage] = usePageParam('page', [search, month, year]);
//
import { useSearchParams } from 'react-router';
import { useEffect } from 'react';

function usePageParam(key = 'page', resetDeps = []) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get(key) || '1', 10));

  function setPage(next) {
    const n = typeof next === 'function' ? next(page) : next;
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (n <= 1) p.delete(key);   // keep URLs clean — no ?page=1
        else p.set(key, String(n));
        return p;
      },
      { replace: true }             // don't pollute browser history
    );
  }

  // Reset to page 1 whenever filter deps change
  useEffect(() => {
    if (resetDeps.length === 0) return;
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  return [page, setPage];
}

export default usePageParam;