import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type FooterPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  hideItems?: number;
};
export const FooterPagination = ({
  page,
  totalPages,
  total,
  pageSize,
  setPage,
  setPageSize,
  hideItems = 0,
}: FooterPaginationProps) => {
  return (
    <div className="absolute bottom-0 h-[5vh] left-0 right-0 flex flex-row justify-between items-center mt-2 px-3 bg-white border-t border-gray-200 rounded-b-lg">
      <div className="text-xs text-gray-600">
        {`Showing page ${page} of ${totalPages} (${total - hideItems} total)`}
      </div>
      <div className="flex flex-row gap-2 items-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  setPage(Math.max(1, page - 1));
                }}
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : 0}
                style={{
                  pointerEvents: page === 1 ? "none" : undefined,
                  opacity: page === 1 ? 0.5 : 1,
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-xs border rounded py-1 px-2">{page}</span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  setPage(Math.min(totalPages, page + 1));
                }}
                aria-disabled={page === totalPages}
                tabIndex={page === totalPages ? -1 : 0}
                style={{
                  pointerEvents: page === totalPages ? "none" : undefined,
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <select
          className="ml-2 px-1 py-1 rounded text-xs border"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          {[25, 50, 75, 100, total].map((size, index) => (
            <option key={index} value={size}>
              {size === total ? "All" : size} Rows
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
