import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import './StatisticalSummary.css';

const StatisticalSummary = ({ data, isRefreshing }) => {
    // Add state to track calculated stats
    const [stats, setStats] = useState(null);

    // Calculate stats whenever data changes or refreshing status changes
    useEffect(() => {
        if (data && data.length > 0) {
            // Force recalculation when refreshing completes
            const calculatedStats = calculateStats(data);
            setStats(calculatedStats);
        } else {
            setStats(null);
        }
    }, [data, isRefreshing]); // Add isRefreshing as dependency to ensure recalculation

    const calculateStats = (data) => {
        if (!data || data.length === 0) return null;

        const stats = {
            totalProduction: 0,
            averageProduction: 0,
            totalArea: 0,
            averageArea: 0,
            averageYield: 0,
            yearRange: {
                start: Infinity,
                end: -Infinity
            },
            cropCount: new Set(),
            regionCount: new Set(),
            highestProduction: {
                value: -Infinity,
                crop: '',
                year: ''
            },
            lowestProduction: {
                value: Infinity,
                crop: '',
                year: ''
            }
        };

        // Track total yields for more accurate average calculation
        let totalCalculatedYield = 0;
        let validYieldCount = 0;

        data.forEach(item => {
            const production = parseFloat(item.production) || 0;
            const area = parseFloat(item.area) || 0;
            
            // Total and average calculations
            stats.totalProduction += production;
            stats.totalArea += area;
            
            // Individual item yield calculation
            if (area > 0) {
                const itemYield = production / area;
                totalCalculatedYield += itemYield;
                validYieldCount++;
            }
            
            // Year range
            const year = parseInt(item.year);
            if (!isNaN(year)) {
                stats.yearRange.start = Math.min(stats.yearRange.start, year);
                stats.yearRange.end = Math.max(stats.yearRange.end, year);
            }
            
            // Count unique crops and regions
            if (item.crop && item.crop !== 'Total Crops') stats.cropCount.add(item.crop);
            if (item.region) stats.regionCount.add(item.region);
            
            // Highest and lowest production
            if (production > stats.highestProduction.value) {
                stats.highestProduction = {
                    value: production,
                    crop: item.crop || 'Unknown',
                    year: item.year || 'Unknown'
                };
            }
            
            if (production < stats.lowestProduction.value && production > 0) {
                stats.lowestProduction = {
                    value: production,
                    crop: item.crop || 'Unknown',
                    year: item.year || 'Unknown'
                };
            }
        });

        // Calculate averages
        stats.averageProduction = stats.totalProduction / data.length;
        stats.averageArea = stats.totalArea / data.length;
        
        // Calculate average yield - use two different methods for accuracy
        if (stats.totalArea > 0) {
            // Direct method: total production / total area
            stats.averageYield = stats.totalProduction / stats.totalArea;
        } else if (validYieldCount > 0) {
            // Average of individual yields when available
            stats.averageYield = totalCalculatedYield / validYieldCount;
        }
        
        // Convert Sets to counts for easier rendering
        stats.cropCount = stats.cropCount.size;
        stats.regionCount = stats.regionCount.size;
        
        // Fix year range if no data
        if (stats.yearRange.start === Infinity) stats.yearRange.start = 'N/A';
        if (stats.yearRange.end === -Infinity) stats.yearRange.end = 'N/A';
        
        return stats;
    };
    
    if (!stats) {
        return (
            <div className="statistical-summary">
                <h2 className="section-title">Statistical Summary</h2>
                <div className="no-data">No data available for analysis</div>
            </div>
        );
    }

    return (
        <div className="statistical-summary" key={JSON.stringify(data)}>
            {isRefreshing && (
                <div className="loading-indicator">
                    <RefreshCcw className="refresh-icon" size={16} />
                    <span className="refresh-text">Refreshing...</span>
                </div>
            )}
            
            <h2 className="section-title">Statistical Summary</h2>
            
            <div className="stats-grid">
                <div className="stat-card production">
                    <div className="stat-icon">📊</div>
                    <h3 className="stat-title">Total Production</h3>
                    <p className="stat-value">{stats.totalProduction.toLocaleString()} tons</p>
                    <p className="stat-detail">Avg: {stats.averageProduction.toLocaleString(undefined, {maximumFractionDigits: 2})} tons per entry</p>
                </div>
                
                <div className="stat-card area">
                    <div className="stat-icon">🌱</div>
                    <h3 className="stat-title">Total Area</h3>
                    <p className="stat-value">{stats.totalArea.toLocaleString()} hectares</p>
                    <p className="stat-detail">Avg: {stats.averageArea.toLocaleString(undefined, {maximumFractionDigits: 2})} hectares per entry</p>
                </div>
                
                <div className="stat-card yield">
                    <div className="stat-icon">⚖️</div>
                    <h3 className="stat-title">Average Yield</h3>
                    <p className="stat-value">{stats.averageYield.toFixed(2)} tons/hectare</p>
                    <p className="stat-detail">Based on total production and area</p>
                </div>
                
                <div className="stat-card time">
                    <div className="stat-icon">📅</div>
                    <h3 className="stat-title">Year Range</h3>
                    <p className="stat-value">{stats.yearRange.start} - {stats.yearRange.end}</p>
                    <p className="stat-detail">Spanning {typeof stats.yearRange.start === 'number' && typeof stats.yearRange.end === 'number' ? stats.yearRange.end - stats.yearRange.start + 1 : '?'} years</p>
                </div>
                
                <div className="stat-card diversity">
                    <div className="stat-icon">🌾</div>
                    <h3 className="stat-title">Data Diversity</h3>
                    <p className="stat-value">{stats.cropCount} crops</p>
                    <p className="stat-detail">Across {stats.regionCount} regions</p>
                </div>
                
                <div className="stat-card highlight">
                    <div className="stat-icon">🏆</div>
                    <h3 className="stat-title">Highest Production</h3>
                    <p className="stat-value">{stats.highestProduction.value.toLocaleString()} tons</p>
                    <p className="stat-detail">{stats.highestProduction.crop} ({stats.highestProduction.year})</p>
                </div>
            </div>
        </div>
    );
};

export default StatisticalSummary;