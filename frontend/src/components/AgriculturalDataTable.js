import React, { useState, useEffect } from 'react';
import { RefreshCw, RefreshCcw, FileText, FileDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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

    // Export data to CSV
    const exportToCSV = () => {
        if (!data || data.length === 0) return;
        
        // Define column headers
        const headers = ['Year', 'Crop', 'Production', 'Area', 'Yield', 'Region', 'Source'];
        
        // Create CSV rows
        const csvRows = [headers.join(',')];
        
        // Add all data rows (not just the paginated data)
        data.forEach(item => {
            const row = [
                item.year,
                item.crop || '',
                item.production || '',
                item.area || '',
                item.cropsYield || item.yield || '',
                item.region || '',
                item.source || ''
            ];
            // Handle any commas in the data by quoting fields
            const sanitizedRow = row.map(field => {
                // If field contains comma, quote it
                if (String(field).includes(',')) {
                    return `"${field}"`;
                }
                return field;
            });
            csvRows.push(sanitizedRow.join(','));
        });
        
        // Create CSV content
        const csvContent = csvRows.join('\n');
        
        // Create blob and save
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const filename = `Agricultural_Data_${new Date().toISOString().split('T')[0]}.csv`;
        saveAs(blob, filename);
    };
    
    // Export data to PDF
    const exportToPDF = () => {
        if (!data || data.length === 0) return;
        
        // Create PDF document
        const doc = new jsPDF('landscape');
        
        // Add title
        doc.setFontSize(16);
        doc.text('Agricultural Data Report', 14, 22);
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        
        // Prepare table data
        const tableHeader = ['Year', 'Crop', 'Production', 'Area', 'Yield', 'Region', 'Source'];
        
        // Use the first 100 rows for PDF (to avoid very large PDFs)
        const tableData = data.slice(0, 100).map(item => [
            item.year,
            item.crop || '',
            item.production || '',
            item.area || '',
            item.cropsYield || item.yield || '',
            item.region || '',
            item.source || ''
        ]);
        
        // Add table
        doc.autoTable({
            head: [tableHeader],
            body: tableData,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [76, 175, 80] },
            didDrawPage: function(data) {
                // Footer
                doc.setFontSize(10);
                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.text(`Page ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, pageHeight - 10);
                
                if (doc.internal.getNumberOfPages() === 1 && tableData.length < data.length) {
                    doc.setFontSize(10);
                    doc.text(`Note: Only displaying first 100 records out of ${data.length} total records.`, 14, pageHeight - 20);
                }
            }
        });
        
        // Save PDF
        const filename = `Agricultural_Data_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
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
                <button 
                    onClick={exportToCSV}
                    className="export-button"
                >
                    <FileText size={16} />
                    <span>Export CSV</span>
                </button>
                <button 
                    onClick={exportToPDF}
                    className="export-button"
                >
                    <FileDown size={16} />
                    <span>Export PDF</span>
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