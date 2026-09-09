import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  pageSize = 8,
  emptyMessage = 'No records found matching criteria.',
  filterComponent = null,
  actionsComponent = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        if (searchKeys.length > 0) {
          return searchKeys.some((key) => {
            const val = item[key];
            return val && String(val).toLowerCase().includes(term);
          });
        }
        return Object.values(item).some(
          (val) => val && String(val).toLowerCase().includes(term)
        );
      });
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB));
        return sortConfig.direction === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [data, searchTerm, searchKeys, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="data-table-container">
      {(searchable || filterComponent || actionsComponent) && (
        <div className="data-table-header">
          <div className="flex items-center gap-3" style={{ flex: 1, minWidth: '260px' }}>
            {searchable && (
              <div className="data-table-search">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
            {filterComponent}
          </div>
          {actionsComponent && <div className="table-actions">{actionsComponent}</div>}
        </div>
      )}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={col.sortable ? 'sortable' : ''}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-muted" style={{ display: 'inline-flex' }}>
                        {sortConfig.key === col.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )
                        ) : (
                          <ChevronsUpDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr key={row.id || row.userId || row.petId || row.caseId || row.appointmentId || row.itemId || idx}>
                  {columns.map((col) => (
                    <td key={col.key || col.header}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <p className="text-muted">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="data-table-footer">
        <div>
          Showing{' '}
          <span className="font-semibold">
            {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{' '}
          of <span className="font-semibold">{filteredData.length}</span> entries
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
