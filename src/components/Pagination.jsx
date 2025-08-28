import React from "react";

export default function Pagination({
  currentPage,
  perPage,
  total,
  lastPage,
  onPageChange,
  onPerPageChange,
}) {
  const handlePageClick = (page) => {
    if (page === "...") return;
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPrev = (offset) => {
    onPageChange(Math.min(Math.max(1, currentPage + offset), lastPage));
  };

  const getPageRange = () => {
    let range = [];
    if (lastPage <= 6) {
      for (let i = 1; i <= lastPage; i++) range.push(i);
    } else {
      if (currentPage <= 3) {
        range = [1, 2, 3, 4, 5, "...", lastPage];
      } else if (currentPage >= lastPage - 2) {
        range = [
          1,
          "...",
          lastPage - 4,
          lastPage - 3,
          lastPage - 2,
          lastPage - 1,
          lastPage,
        ];
      } else {
        range = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          lastPage,
        ];
      }
    }
    return range;
  };

  const startIdx = (currentPage - 1) * perPage + 1;
  const endIdx = Math.min(currentPage * perPage, total);

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-700 font-medium">
          Rows per page:
        </label>
        <select
          className="border rounded px-2 py-1"
          value={perPage}
          onChange={(e) => {
            onPerPageChange(Number(e.target.value));
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-gray-500">
          Menampilkan {startIdx} to {endIdx} dari {total} results
        </span>
      </div>
      <ul className="flex flex-row gap-2">
        <li>
          <button
            className={`btn btn-sm ${currentPage === 1 ? "btn-disabled" : ""}`}
            onClick={() => handleNextPrev(-1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
        </li>
        {getPageRange().map((page, i) =>
          page === "..." ? (
            <li key={i}>
              <span className="btn btn-sm btn-disabled">...</span>
            </li>
          ) : (
            <li key={page}>
              <button
                className={`btn btn-sm ${
                  currentPage === page
                    ? "btn-active btn btn-outline"
                    : "btn btn-outline"
                }`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            </li>
          )
        )}
        <li>
          <button
            className={`btn btn-sm ${
              currentPage === lastPage ? "btn-disabled" : ""
            }`}
            onClick={() => handleNextPrev(1)}
            disabled={currentPage === lastPage}
          >
            &gt;
          </button>
        </li>
      </ul>
    </div>
  );
}
