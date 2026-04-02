const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
      <p className="text-xs text-gray-500">
        Showing <span className="font-bold text-gray-700">{from}–{to}</span> of{" "}
        <span className="font-bold text-gray-700">{total}</span> entries
      </p>

      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!pagination.hasPrevPage}
          className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          «
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!pagination.hasPrevPage}
          className="px-3 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) {
              acc.push('...');
            }
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === '...' ? (
              <span key={`dot-${idx}`} className="px-2 py-1 text-xs text-gray-400">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-1 text-xs border rounded transition-colors ${
                  p === page
                    ? 'bg-green-600 text-white border-green-600 font-bold'
                    : 'hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            )
          )
        }

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.hasNextPage}
          className="px-3 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!pagination.hasNextPage}
          className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;