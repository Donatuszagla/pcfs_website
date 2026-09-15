import { CaretLeft, CaretRight } from "@phosphor-icons/react";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  scrollToTop?: boolean;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  scrollToTop = true,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalItems, currentPage * pageSize);

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    if (scrollToTop && typeof window !== "undefined") {
      window.scrollTo({ top: Math.max(0, window.scrollY - 300), behavior: "smooth" });
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const delta = 1;

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
    <nav className="site-pagination-container" aria-label="Page navigation">
      <div className="site-pagination-summary">
        Showing <strong>{startIndex}</strong>–<strong>{endIndex}</strong> of{" "}
        <strong>{totalItems}</strong> items
      </div>

      <div className="site-pagination-nav">
        <button
          type="button"
          className="site-pagination-arrow-btn"
          disabled={currentPage === 1}
          onClick={() => handlePageClick(currentPage - 1)}
          aria-label="Previous page"
        >
          <CaretLeft size={16} weight="bold" />
          <span>Previous</span>
        </button>

        <div className="site-pagination-pages">
          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="site-pagination-ellipsis" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={`p-${p}`}
                type="button"
                className={`site-pagination-page-btn ${currentPage === p ? "active" : ""}`}
                onClick={() => handlePageClick(p)}
                aria-current={currentPage === p ? "page" : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          className="site-pagination-arrow-btn"
          disabled={currentPage === totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
          aria-label="Next page"
        >
          <span>Next</span>
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </nav>
  );
}
