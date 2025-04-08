import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { RefreshCcw } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './TrendAnalysis.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const TrendAnalysis = ({ data, isRefreshing }) => {
    // Add state to track processed data
    const [processedData, setProcessedData] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [growthStats, setGrowthStats] = useState({
        avgProductionGrowth: 'N/A',
        avgAreaGrowth: 'N/A',
        avgYieldGrowth: 'N/A'
    });
    const [selectedCrop, setSelectedCrop] = useState('all');
    const [selectedRegion, setSelectedRegion] = useState('all');

    // Process data whenever it changes
    useEffect(() => {
        if (data && data.length > 0) {
            const newProcessedData = processData(data);
            setProcessedData(newProcessedData);
            
            if (newProcessedData) {
                // Generate chart data
                setChartData(generateChartData(newProcessedData));
                
                // Calculate growth rates
                calculateGrowthRates(newProcessedData);
            }
        } else {
            setProcessedData(null);
            setChartData(null);
            setGrowthStats({
                avgProductionGrowth: 'N/A',
                avgAreaGrowth: 'N/A',
                avgYieldGrowth: 'N/A'
            });
        }
    }, [data]);

    const processData = (data) => {
        if (!data || data.length === 0) return null;

        // Group data by year
        const yearlyData = data.reduce((acc, item) => {
            const year = item.year;
            if (!acc[year]) {
                acc[year] = {
                    production: 0,
                    area: 0,
                    yield: 0,
                    count: 0
                };
            }
            acc[year].production += item.production || 0;
            acc[year].area += item.area || 0;
            acc[year].count += 1;
            return acc;
        }, {});

        // Calculate averages and prepare chart data
        const years = Object.keys(yearlyData).sort();
        
        // Calculate yield for each year after summing production and area
        years.forEach(year => {
            if (yearlyData[year].area > 0) {
                yearlyData[year].yield = yearlyData[year].production / yearlyData[year].area;
            } else {
                yearlyData[year].yield = 0;
            }
        });
        
        const productionData = years.map(year => yearlyData[year].production);
        const areaData = years.map(year => yearlyData[year].area);
        const yieldData = years.map(year => yearlyData[year].yield);

        return {
            years,
            yearlyData,
            productionData,
            areaData,
            yieldData
        };
    };
    
    const calculateGrowthRates = (processed) => {
        if (!processed || processed.years.length <= 1) {
            setGrowthStats({
                avgProductionGrowth: 'N/A',
                avgAreaGrowth: 'N/A',
                avgYieldGrowth: 'N/A'
            });
            return;
        }

        const growthRates = {
            production: [],
            area: [],
            yield: []
        };

        const { years, productionData, areaData, yieldData } = processed;

        // Calculate year-over-year growth for each metric
        for (let i = 1; i < years.length; i++) {
            const prevProduction = productionData[i-1];
            const currProduction = productionData[i];
            let productionGrowth = prevProduction > 0 
                ? ((currProduction - prevProduction) / prevProduction) * 100
                : 0;
            
            // Cap production growth at -100% to 100%
            productionGrowth = Math.max(-100, Math.min(productionGrowth, 100));
            
            const prevArea = areaData[i-1];
            const currArea = areaData[i];
            let areaGrowth = prevArea > 0 
                ? ((currArea - prevArea) / prevArea) * 100
                : 0;
            
            // Cap area growth at -100% to 100%
            areaGrowth = Math.max(-100, Math.min(areaGrowth, 100));
            
            const prevYield = yieldData[i-1];
            const currYield = yieldData[i];
            let yieldGrowth = prevYield > 0 
                ? ((currYield - prevYield) / prevYield) * 100
                : 0;
            
            // Cap yield growth at -100% to 100%
            yieldGrowth = Math.max(-100, Math.min(yieldGrowth, 100));
            
            growthRates.production.push(productionGrowth);
            growthRates.area.push(areaGrowth);
            growthRates.yield.push(yieldGrowth);
        }

        // Calculate average growth rates
        const avgProductionGrowth = growthRates.production.length > 0
            ? (growthRates.production.reduce((sum, rate) => sum + rate, 0) / growthRates.production.length).toFixed(2)
            : 'N/A';
        
        const avgAreaGrowth = growthRates.area.length > 0
            ? (growthRates.area.reduce((sum, rate) => sum + rate, 0) / growthRates.area.length).toFixed(2)
            : 'N/A';
        
        const avgYieldGrowth = growthRates.yield.length > 0
            ? (growthRates.yield.reduce((sum, rate) => sum + rate, 0) / growthRates.yield.length).toFixed(2)
            : 'N/A';

        setGrowthStats({
            avgProductionGrowth,
            avgAreaGrowth,
            avgYieldGrowth
        });
    };

    const generateChartData = (processed) => {
        return {
            labels: processed.years,
            datasets: [
                {
                    label: 'Production (tons)',
                    data: processed.productionData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    tension: 0.3,
                    yAxisID: 'y',
                    borderWidth: 2,
                    pointBackgroundColor: '#4CAF50'
                },
                {
                    label: 'Area (hectares)',
                    data: processed.areaData,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    tension: 0.3,
                    yAxisID: 'y1',
                    borderWidth: 2,
                    pointBackgroundColor: '#2196F3'
                },
                {
                    label: 'Yield (tons/hectare)',
                    data: processed.yieldData,
                    borderColor: '#9C27B0',
                    backgroundColor: 'rgba(156, 39, 176, 0.2)',
                    tension: 0.3,
                    yAxisID: 'y2',
                    borderWidth: 2,
                    pointBackgroundColor: '#9C27B0'
                }
            ]
        };
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'rgba(255, 255, 255, 0.87)',
                    padding: 10,
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 10,
                titleFont: {
                    size: window.innerWidth < 768 ? 11 : 13
                },
                bodyFont: {
                    size: window.innerWidth < 768 ? 10 : 12
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.87)',
                    padding: 5,
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Production (tons)',
                    color: 'rgba(255, 255, 255, 0.87)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.87)',
                    padding: 10
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Area (hectares)',
                    color: 'rgba(255, 255, 255, 0.87)'
                },
                grid: {
                    drawOnChartArea: false,
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.87)',
                    padding: 10
                }
            },
            y2: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Yield (tons/hectare)',
                    color: 'rgba(255, 255, 255, 0.87)'
                },
                grid: {
                    drawOnChartArea: false,
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.87)',
                    padding: 10
                }
            }
        }
    };

    if (!processedData) {
        return (
            <div className="trend-analysis">
                <h2 className="section-title">Trend Analysis</h2>
                <div className="no-data">No data available for trend analysis</div>
            </div>
        );
    }

    return (
        <div className="trend-analysis">
            {isRefreshing && (
                <div className="loading-indicator">
                    <RefreshCcw className="refresh-icon" size={16} />
                    <span className="refresh-text">Refreshing...</span>
                </div>
            )}
            
            <h2 className="section-title">Trend Analysis</h2>

            <div className="chart-container" style={{ height: '400px' }}>
                {chartData && <Line data={chartData} options={options} />}
            </div>
            
            <div className="trend-insights">
                <div className="insight-card">
                    <div className="insight-title">Production Growth</div>
                    <div className={`insight-value ${parseFloat(growthStats.avgProductionGrowth) >= 0 ? 'positive' : 'negative'}`}>
                        {growthStats.avgProductionGrowth !== 'N/A' ? `${growthStats.avgProductionGrowth}%` : growthStats.avgProductionGrowth}
                        {growthStats.avgProductionGrowth !== 'N/A' && parseFloat(growthStats.avgProductionGrowth) >= 0 ? ' ↑' : ' ↓'}
                    </div>
                </div>
                <div className="insight-card">
                    <div className="insight-title">Area Growth</div>
                    <div className={`insight-value ${parseFloat(growthStats.avgAreaGrowth) >= 0 ? 'positive' : 'negative'}`}>
                        {growthStats.avgAreaGrowth !== 'N/A' ? `${growthStats.avgAreaGrowth}%` : growthStats.avgAreaGrowth}
                        {growthStats.avgAreaGrowth !== 'N/A' && parseFloat(growthStats.avgAreaGrowth) >= 0 ? ' ↑' : ' ↓'}
                    </div>
                </div>
                <div className="insight-card">
                    <div className="insight-title">Yield Growth</div>
                    <div className={`insight-value ${parseFloat(growthStats.avgYieldGrowth) >= 0 ? 'positive' : 'negative'}`}>
                        {growthStats.avgYieldGrowth !== 'N/A' ? `${growthStats.avgYieldGrowth}%` : growthStats.avgYieldGrowth}
                        {growthStats.avgYieldGrowth !== 'N/A' && parseFloat(growthStats.avgYieldGrowth) >= 0 ? ' ↑' : ' ↓'}
                    </div>
                </div>
                <div className="insight-card">
                    <div className="insight-title">Data Points</div>
                    <div className="insight-value neutral">{processedData.years.length}</div>
                </div>
            </div>
            
            
        </div>
    );
};

export default TrendAnalysis;