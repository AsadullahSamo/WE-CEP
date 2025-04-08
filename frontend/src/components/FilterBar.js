import React, { useState, useEffect } from 'react';
import { Search, Calendar, Wheat, MapPin, RefreshCw } from 'lucide-react';
import './FilterBar.css';

const FilterBar = ({ onFilterChange, onRefresh, isRefreshing, data }) => {
    const [filters, setFilters] = useState({
        search: '',
        year: '',
        crop: '',
        region: ''
    });
    
    const [options, setOptions] = useState({
        years: [],
        crops: [],
        regions: []
    });

    // Extract unique filter options from data when data changes
    useEffect(() => {
        if (data && data.length > 0) {
            const uniqueYears = [...new Set(data.map(item => item.year))].sort((a, b) => b - a); // Most recent years first
            const uniqueCrops = [...new Set(data.map(item => item.crop))].sort();
            const uniqueRegions = [...new Set(data.map(item => item.region))].sort();
            
            setOptions({
                years: uniqueYears,
                crops: uniqueCrops,
                regions: uniqueRegions
            });
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            search: '',
            year: '',
            crop: '',
            region: ''
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    return (
        <div className="filter-bar-container">
            <div className="filter-bar">
                <div className="search-box">
                    <Search className="icon" />
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Search crops, regions..."
                        className="search-input"
                    />
                    {filters.search && (
                        <button 
                            className="clear-search" 
                            onClick={() => handleChange({ target: { name: 'search', value: '' } })}
                        >
                            ×
                        </button>
                    )}
                </div>
                
                <div className="filter-section">
                    <div className="filters">
                        <div className="filter-group">
                            <select name="year" value={filters.year} onChange={handleChange} className="filter-select">
                                <option value="">All Years</option>
                                {options.years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <Calendar className="filter-icon" />
                        </div>
                        <div className="filter-group">
                            <select name="crop" value={filters.crop} onChange={handleChange} className="filter-select">
                                <option value="">All Crops</option>
                                {options.crops.map(crop => (
                                    <option key={crop} value={crop}>{crop}</option>
                                ))}
                            </select>
                            <Wheat className="filter-icon" />
                        </div>
                        <div className="filter-group">
                            <select name="region" value={filters.region} onChange={handleChange} className="filter-select">
                                <option value="">All Regions</option>
                                {options.regions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                            <MapPin className="filter-icon" />
                        </div>
                    </div>
                    
                    <div className="filter-actions">
                        {(filters.search || filters.year || filters.crop || filters.region) && (
                            <button 
                                className="clear-filters-button" 
                                onClick={handleClearFilters}
                            >
                                Clear Filters
                            </button>
                        )}
                        <button 
                            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`} 
                            onClick={onRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`icon ${isRefreshing ? 'spin' : ''}`} />
                            <span className="refresh-text">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {(filters.search || filters.year || filters.crop || filters.region) && (
                <div className="active-filters">
                    <span className="active-filters-label">Active filters:</span>
                    {filters.search && (
                        <div className="filter-tag">
                            Search: {filters.search}
                            <button className="remove-filter" onClick={() => handleChange({ target: { name: 'search', value: '' } })}>×</button>
                        </div>
                    )}
                    {filters.year && (
                        <div className="filter-tag">
                            Year: {filters.year}
                            <button className="remove-filter" onClick={() => handleChange({ target: { name: 'year', value: '' } })}>×</button>
                        </div>
                    )}
                    {filters.crop && (
                        <div className="filter-tag">
                            Crop: {filters.crop}
                            <button className="remove-filter" onClick={() => handleChange({ target: { name: 'crop', value: '' } })}>×</button>
                        </div>
                    )}
                    {filters.region && (
                        <div className="filter-tag">
                            Region: {filters.region}
                            <button className="remove-filter" onClick={() => handleChange({ target: { name: 'region', value: '' } })}>×</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterBar;