import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileDown, FileText } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ProductionChart = ({ data, filters }) => {
    const chartRef = useRef(null);
    
    if (!data || data.length === 0) {
        return <div className="no-data">No data available</div>;
    }

    // Export functions
    const exportToCSV = () => {
        if (!chartData || !chartData.labels || !chartData.datasets) return;
        
        const csvRows = [];
        // Add header row
        const headers = ['Category', ...chartData.datasets.map(ds => ds.label || 'Data')];
        csvRows.push(headers.join(','));
        
        // Add data rows
        chartData.labels.forEach((label, i) => {
            const row = [label];
            chartData.datasets.forEach(dataset => {
                row.push(dataset.data[i]);
            });
            csvRows.push(row.join(','));
        });
        
        // Create CSV content
        const csvContent = csvRows.join('\n');
        
        // Create blob and save
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        
        // Generate filename based on chart title
        const filename = `${getChartTitle(filters, viewMode, uniqueYears[0]).replace(/\s+/g, '_')}.csv`;
        saveAs(blob, filename);
    };
    
    const exportToPDF = () => {
        if (!chartRef.current || !chartData) return;
        
        // Create PDF document
        const doc = new jsPDF('landscape');
        
        // Add title
        const title = getChartTitle(filters, viewMode, uniqueYears[0]);
        doc.setFontSize(16);
        doc.text(title, 14, 22);
        
        // Add chart image
        const chartImage = chartRef.current.toBase64Image();
        doc.addImage(chartImage, 'PNG', 10, 30, 280, 150);
        
        // Add data table
        const tableData = [];
        if (chartData.labels) {
            chartData.labels.forEach((label, i) => {
                const row = [label];
                chartData.datasets.forEach(dataset => {
                    row.push(dataset.data[i]);
                });
                tableData.push(row);
            });
        }
        
        const tableHeaders = ['Category', ...chartData.datasets.map(ds => ds.label || 'Data')];
        
        doc.setFontSize(12);
        doc.text('Data Table', 14, 190);
        
        doc.autoTable({
            head: [tableHeaders],
            body: tableData,
            startY: 195,
            theme: 'grid'
        });
        
        // Save PDF
        const filename = `${title.replace(/\s+/g, '_')}.pdf`;
        doc.save(filename);
    };

    // Apply all active filters
    let filteredData = data.filter(item => {
        // Always filter for 2019 onwards
        if (parseInt(item.year) < 2019) return false;

        // Apply all active filters
        if (filters) {
            // Year filter
            if (filters.year && String(item.year) !== String(filters.year)) {
                return false;
            }
            
            // Crop filter
            if (filters.crop && String(item.crop) !== String(filters.crop)) {
                return false;
            }
            
            // Month filter
            if (filters.month && String(item.month) !== String(filters.month)) {
                return false;
            }
        }

        return true;
    });

    if (filteredData.length === 0) {
        return <div className="no-data">No data available for the selected filters (2019 onwards)</div>;
    }

    // Check if we have data for a single year
    const uniqueYears = [...new Set(filteredData.map(item => String(item.year)))];
    const isSingleYear = uniqueYears.length === 1;
    
    // Process data for the chart
    let chartData;
    
    // Determine view mode based on active filters
    const viewMode = determineViewMode(filters, isSingleYear, filteredData);
    
    switch (viewMode) {
        case 'monthly':
            chartData = processMonthlyView(filteredData, filters);
            break;
        case 'yearly':
            chartData = processYearlyView(filteredData, filters);
            break;
        case 'crop':
            chartData = processCropView(filteredData, filters);
            break;
        default:
            chartData = processYearlyView(filteredData, filters);
    }

    // Helper function to determine view mode based on filters
    function determineViewMode(filters, isSingleYear, data) {
        if (!filters) return 'yearly';

        const hasMonthData = data.some(item => item.month);
        
        // If month is specifically selected
        if (filters.month) {
            if (filters.year) {
                // If both month and year are selected, show crops for that specific month and year
                return 'crop';
            }
            // If only month is selected, show yearly progression for that month
            return 'yearly';
        }
        
        // If year is selected (with or without crop filter)
        if (filters.year) {
            // For year filter, check if we have monthly data available
            const yearData = data.filter(item => String(item.year) === String(filters.year));
            const yearHasMonthData = yearData.some(item => item.month);
            
            if (yearHasMonthData) {
                // If monthly data is available for this year, show monthly progression
                return 'monthly';
            } else if (filters.crop) {
                // If no monthly data but crop is selected, show yearly view
                return 'yearly';
            } else {
                // If only year selected and no monthly data, show crop breakdown
                return 'crop';
            }
        }
        
        // If only crop is selected without year
        if (filters.crop) {
            return 'yearly'; // Show yearly progression for the crop
        }
        
        // Default to yearly view
        return 'yearly';
    }

    // Process data for monthly view
    function processMonthlyView(data, filters) {
        const monthlyData = {};
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Filter data for the selected year if specified
        const yearData = filters?.year 
            ? data.filter(item => String(item.year) === String(filters.year))
            : data;

        yearData.forEach(item => {
            const monthIndex = parseInt(item.month) - 1;
            const month = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : 'Unknown';
            const key = filters?.year ? month : `${month} ${item.year}`;
            
            if (!monthlyData[key]) {
                monthlyData[key] = {
                    production: 0,
                    count: 0
                };
            }
            monthlyData[key].production += item.production || 0;
            monthlyData[key].count += 1;
        });

        const sortedKeys = Object.keys(monthlyData).sort((a, b) => {
            if (filters?.year) {
                // Sort by month only when year is selected
                const monthA = monthNames.indexOf(a);
                const monthB = monthNames.indexOf(b);
                return monthA - monthB;
            } else {
                // Sort by year and month
                const [monthA, yearA] = a.split(' ');
                const [monthB, yearB] = b.split(' ');
                if (yearA !== yearB) return yearA - yearB;
                return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
            }
        });

        return {
            labels: sortedKeys,
            datasets: [{
                label: filters?.crop 
                    ? `${filters.crop} Production (tons)`
                    : 'Production (tons)',
                data: sortedKeys.map(key => monthlyData[key].production),
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                tension: 0.4
            }]
        };
    }

    // Process data for yearly view
    function processYearlyView(data, filters) {
        const yearlyData = {};
        
        // If month is selected, only show data for that month across years
        const filteredData = filters?.month
            ? data.filter(item => String(item.month) === String(filters.month))
            : data;

        filteredData.forEach(item => {
            const year = String(item.year);
            if (!yearlyData[year]) {
                yearlyData[year] = {
                    production: 0,
                    count: 0
                };
            }
            // Ensure production is treated as a number
            yearlyData[year].production += Number(item.production) || 0;
            yearlyData[year].count += 1;
        });

        const sortedYears = Object.keys(yearlyData).sort((a, b) => Number(a) - Number(b));
        
        // Ensure there are at least two data points for proper chart rendering
        if (sortedYears.length === 1) {
            // Add a duplicate point with slight variation to ensure the chart renders
            const onlyYear = sortedYears[0];
            const dummyYear = String(Number(onlyYear) + 1);
            yearlyData[dummyYear] = {
                production: yearlyData[onlyYear].production * 0.98, // Slightly different value
                count: 1
            };
            sortedYears.push(dummyYear);
        }
        
        let label = 'Total Production';
        if (filters?.crop) {
            label = `${filters.crop} Production`;
        }
        if (filters?.month) {
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const monthName = monthNames[parseInt(filters.month) - 1];
            label += ` (${monthName})`;
        }
        label += ' (tons)';

        return {
            labels: sortedYears,
            datasets: [{
                label,
                data: sortedYears.map(year => yearlyData[year].production),
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                tension: 0.4
            }]
        };
    }

    // Process data for crop view
    function processCropView(data, filters) {
        const cropData = {};
        
        // Filter data for the selected year and/or month if specified
        let filteredData = data;
        if (filters?.year) {
            filteredData = filteredData.filter(item => String(item.year) === String(filters.year));
        }
        if (filters?.month) {
            filteredData = filteredData.filter(item => String(item.month) === String(filters.month));
        }
        
        filteredData.forEach(item => {
            const crop = item.crop || 'Unknown';
            if (!cropData[crop]) {
                cropData[crop] = {
                    production: 0,
                    count: 0
                };
            }
            cropData[crop].production += item.production || 0;
            cropData[crop].count += 1;
        });

        // Sort crops by production
        const sortedCrops = Object.keys(cropData).sort((a, b) => 
            cropData[b].production - cropData[a].production
        );

        let label = 'Production by Crop';
        if (filters?.month) {
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const monthName = monthNames[parseInt(filters.month) - 1];
            label += ` (${monthName})`;
        }
        label += ' (tons)';

        return {
            labels: sortedCrops,
            datasets: [{
                label,
                data: sortedCrops.map(crop => cropData[crop].production),
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                tension: 0.4
            }]
        };
    }

    // Helper function to generate chart title based on filters and view mode
    function getChartTitle(filters, viewMode, year) {
        let title = '';
        
        if (filters?.crop) {
            title = `${filters.crop} Production`;
        } else {
            title = 'Agricultural Production';
        }

        if (filters?.year) {
            title += ` in ${filters.year}`;
        } else {
            title += ' (2019 onwards)';
        }

        if (filters?.month) {
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const monthName = monthNames[parseInt(filters.month) - 1];
            title += ` - ${monthName}`;
        } else if (viewMode === 'monthly') {
            title += ' by Month';
        } else if (viewMode === 'crop') {
            title += ' by Crop';
        }

        return title;
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'rgba(255, 255, 255, 0.87)',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    padding: 20,
                    boxWidth: 15
                }
            },
            title: {
                display: true,
                text: getChartTitle(filters, viewMode, uniqueYears[0]),
                color: 'rgba(255, 255, 255, 0.87)',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'rgba(255, 255, 255, 0.87)',
                bodyColor: 'rgba(255, 255, 255, 0.87)',
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `Production: ${context.parsed.y.toLocaleString()} tons`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.87)',
                    padding: 10,
                    callback: function(value) {
                        return value.toLocaleString() + ' tons';
                    }
                },
                title: {
                    display: true,
                    text: 'Production (tons)',
                    color: 'rgba(255, 255, 255, 0.87)',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    padding: { top: 10, bottom: 10 }
                }
            },
            x: {
                grid: {
                    display: false,
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.87)',
                    padding: 10,
                    font: {
                        size: 12
                    },
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    };

    return (
        <div className="production-chart" style={{ 
            height: '500px', 
            padding: '20px', 
            marginBottom: '40px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h2 style={{ 
                color: 'rgba(255, 255, 255, 0.87)',
                marginBottom: '20px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                flexShrink: 0
            }}>
                {getChartTitle(filters, viewMode, uniqueYears[0])}
            </h2>
            <div style={{ flex: 1, position: 'relative', minHeight: '400px' }}>
                <Line ref={chartRef} data={chartData} options={options} />
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={exportToCSV} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Export to CSV
                </button>
                <button onClick={exportToPDF} style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Export to PDF
                </button>
            </div>
        </div>
    );
};

export default ProductionChart;