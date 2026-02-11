import './table.scss';
import { useState } from 'react';


interface TableProps {
  tableClassName?: string;
  useQuery: (options: { page: number; perPage: number }) => any;
  structure: {
    label: string;
    key?: string;
    fitContent?: boolean;
    className?: string;
    render?: (row: any) => React.ReactNode;
  }[];
}


export function Table({ useQuery, structure, tableClassName }: TableProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data, isLoading, error } = useQuery({
    page,
    perPage,
  });

  const users = data?.data || [];
  const lastPage = data?.last_page || 1;

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    if (lastPage <= maxVisiblePages) return Array.from({ length: lastPage }, (_, i) => i + 1);
    
    let start: number;
    let end: number;
    
    if (page <= 3) {
      start = 1;
      end = maxVisiblePages;
    } else if (page >= lastPage - 2) {
      start = lastPage - maxVisiblePages + 1;
      end = lastPage;
    } else {
      start = page - 2;
      end = page + 2;
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <>
      <div className='table-component-wrapper'>
        <table className={`table-component-container ${tableClassName || ''}`}>
          <colgroup>
            {structure.map((col, index) => (
              <col key={`col-${index}`} style={col.fitContent ? { width: 0 } : undefined} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {structure.map((col, index) => (
                <th key={`header-${index}`}>{col.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {users.map((row: any, index: number) => (
              <tr key={'row-' + index}>
                {structure.map((col, colIndex) => (
                  <td key={`cell-${index}-${colIndex}`} className={col.className}>
                    {col.render ? col.render(row) : row[col.key || '']}
                  </td>
                ))}
              </tr>
            ))}

            {(isLoading || !users.length || error) && (
              <tr>
                <td colSpan={structure.length} className='no-data'>
                  {(!isLoading && !error) && "No data available" }
                  {isLoading && "Loading..." }
                  {error && "Error loading data." }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className='table-selectors'>
        <label htmlFor="rows-select" className='rows-select'>
          Show
          <select name="rows" id="rows-select" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          rows
        </label>

        <article className='page-container'>
          <span className='side edge' onClick={() => setPage(1)}>«</span>
          <span className='side' onClick={() => setPage(page > 1 ? page - 1 : 1)}>Previous</span>
          {getPageNumbers().map((pageNumber) => (
            <span
              key={pageNumber}
              className={`page-number ${page === pageNumber ? 'current' : ''}`}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </span>
          ))}
          <span className='side' onClick={() => setPage(page < lastPage ? page + 1 : lastPage)}>Next</span>
          <span className='side edge' onClick={() => setPage(lastPage)}>»</span>
        </article>
      </section>

    </>
  );
}