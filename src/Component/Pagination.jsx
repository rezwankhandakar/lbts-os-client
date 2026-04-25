
const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  const btnBase =
    "h-8 min-w-[32px] px-2.5 text-xs font-semibold rounded-lg border transition-all duration-150 flex items-center justify-center";
  const btnDefault =
    `${btnBase} border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 bg-white`;
  const btnActive =
    `${btnBase} bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200`;
  const btnDisabled =
    `${btnBase} border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-white">
      {/* Info */}
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-bold text-slate-700">{from}–{to}</span>
        {" "}of{" "}
        <span className="font-bold text-slate-700">{total}</span> entries
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={!pagination.hasPrevPage}
          className={!pagination.hasPrevPage ? btnDisabled : btnDefault}
        >«</button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!pagination.hasPrevPage}
          className={!pagination.hasPrevPage ? btnDisabled : btnDefault}
        >‹ Prev</button>

        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`d-${i}`} className="px-1.5 text-slate-400 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={p === page ? btnActive : btnDefault}
            >{p}</button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.hasNextPage}
          className={!pagination.hasNextPage ? btnDisabled : btnDefault}
        >Next ›</button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!pagination.hasNextPage}
          className={!pagination.hasNextPage ? btnDisabled : btnDefault}
        >»</button>
      </div>
    </div>
  );
};

export default Pagination;
