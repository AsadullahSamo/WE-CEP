import React, { useState, useEffect } from 'react';
import { RefreshCw, RefreshCcw } from 'lucide-react';
import './AgriculturalDataTable.css';

const AgriculturalDataTable = ({ data, onRefresh, isRefreshing }) => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [paginatedData, setPaginatedData] = useState([]);

    // Calculate pagination whenever data or pagination settings change
    useEffect(() => {
        console.log('Data updated in AgriculturalDataTable:', data?.length);
        
        if (!data || data.length === 0) {
            setPaginatedData([]);
            setTotalPages(0);
            return;
        }

        // Calculate total pages
        const calculatedTotalPages = Math.ceil(data.length / pageSize);
        setTotalPages(calculatedTotalPages);

        // Ensure current page is valid
        if (currentPage > calculatedTotalPages) {
            setCurrentPage(1);
        }

        // Calculate start and end indices
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, data.length);

        // Set paginated data
        setPaginatedData(data.slice(startIndex, endIndex));
    }, [data, currentPage, pageSize]);

    // Reset to first page when data changes completely (not during refresh)
    useEffect(() => {
        if (!isRefreshing && data?.length > 0) {
            console.log('Data changed (not during refresh), resetting to page 1');
            setCurrentPage(1);
        }
    }, [data, isRefreshing]);

    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Handle page size change
    const handlePageSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // Generate page numbers for pagination controls
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxButtons = 5; // Maximum number of page buttons to show
        
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;
        
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        return pageNumbers;
    };

    // Don't show "No data available" when refreshing - only when truly no data
    if ((!data || data.length === 0) && !isRefreshing) {
        return <div className="no-data">No data available</div>;
    }
    
    // Always display the current data from props during both normal state and refresh
    const displayData = paginatedData.length > 0 ? paginatedData : 
                         data?.length > 0 ? data.slice(0, pageSize) : [];

    return (
        <div className="agricultural-data-table">
            <div className="table-header">
                <h2>Agricultural Data</h2>
                <button 
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="refresh-button"
                >
                    {isRefreshing ? (
                        <>
                            <RefreshCcw className="refresh-icon" size={16} />
                            <span className="refresh-text">Refreshing...</span>
                        </>
                    ) : (
                        <>
                            <RefreshCw size={16} />
                            <span>Refresh Data</span>
                        </>
                    )}
                </button>
            </div>
            
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th>Crop</th>
                            <th>Production</th>
                            <th>Area</th>
                            <th>Yield</th>
                            <th>Region</th>
                            <th className="source-header">Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((item) => (
                            <tr key={item._id}>
                                <td>{item.year}</td>
                                <td>{item.crop}</td>
                                <td>{item.production}</td>
                                <td>{item.area}</td>
                                <td>{item.cropsYield || item.yield}</td>
                                <td>{item.region}</td>
                                <td className="source-column">{item.source}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="pagination-container">
                <div className="pagination-info">
                    Showing {displayData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {(currentPage - 1) * pageSize + displayData.length} of {data.length} entries
                </div>
                
                <div className="pagination-controls">
                    <div className="page-size-selector">
                        <label htmlFor="page-size">Show</label>
                        <select 
                            id="page-size" 
                            value={pageSize} 
                            onChange={handlePageSizeChange}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    
                    <button 
                        className="pagination-button"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(1)}
                    >
                        First
                    </button>
                    
                    <button 
                        className="pagination-button"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        &laquo;
                    </button>
                    
                    {getPageNumbers().map(page => (
                        <button
                            key={page}
                            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ))}
                    
                    <button 
                        className="pagination-button"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        &raquo;
                    </button>
                    
                    <button 
                        className="pagination-button"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                    >
                        Last
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgriculturalDataTable;