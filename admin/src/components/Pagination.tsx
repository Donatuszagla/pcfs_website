import {
  CaretLeft,
  CaretRight,
  CaretDoubleLeft,
  CaretDoubleRight,
} from "@phosphor-icons/react";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= 0) return null;

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalItems, currentPage * pageSize);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const delta = 1; // Number of pages on each side of current

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        pages[pages.length - 1] !== "..." &&
        (i < currentPage - delta || i > currentPage + delta)
      ) {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="admin-pagination-container" role="navigation" aria-label="Pagination Navigation">
      <div className="admin-pagination-info">
        <span>
          Showing <strong>{startIndex}</strong>–<strong>{endIndex}</strong> of{" "}
          <strong>{totalItems}</strong> records
        </span>

        {onPageSizeChange && (
          <div className="admin-pagination-size">
            <label htmlFor="admin-page-size-select">Per page:</label>
            <select
              id="admin-page-size-select"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="admin-page-size-select"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            title="First Page"
            aria-label="First Page"
          >
            <CaretDoubleLeft size={15} />
          </button>

          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            title="Previous Page"
            aria-label="Previous Page"
          >
            <CaretLeft size={15} />
          </button>

          <div className="pagination-numbers">
            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="pagination-ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  className={`pagination-number-btn ${currentPage === p ? "active" : ""}`}
                  onClick={() => onPageChange(p)}
                  aria-current={currentPage === p ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            title="Next Page"
            aria-label="Next Page"
          >
            <CaretRight size={15} />
          </button>

          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            title="Last Page"
            aria-label="Last Page"
          >
            <CaretDoubleRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
