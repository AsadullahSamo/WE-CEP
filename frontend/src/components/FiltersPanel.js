import React from 'react';
import './FiltersPanel.css';

const FiltersPanel = ({ filters, setFilters, data }) => {
    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    // Clear all filters
    const clearFilters = () => {
        setFilters({
            searchQuery: '',
            year: 'all',
            crop: 'all',
            region: 'all'
        });
    };

    // Get unique crops from data
    const getUniqueCrops = () => {
        if (!data || data.length === 0) return [];
        const crops = [...new Set(data.map(item => item.crop))]
            .filter(crop => crop && crop.trim() !== '')
            .sort();
        
        // Move "Total Crops" to the beginning if it exists
        const totalCropsIndex = crops.indexOf('Total Crops');
        if (totalCropsIndex > -1) {
            crops.splice(totalCropsIndex, 1);
            crops.unshift('Total Crops');
        }
        
        return crops;
    };
    
    return (
        <div className="filters-panel">
            <div className="search-container">
                <div className="filter-group search-group">
                    <label htmlFor="search-filter">Search</label>
                    <i className="filter-icon">🔍</i>
                    <input
                        id="search-filter"
                        type="text"
                        placeholder="Search crops, regions..."
                        value={filters.searchQuery}
                        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    />
                </div>
            </div>
            
            <div className="filters-container">
                <div className="filter-group">
                    <label htmlFor="year-filter">Year</label>
                    <i className="filter-icon">📅</i>
                    <select
                        id="year-filter"
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                    >
                        <option value="all">All Years</option>
                        <option value="2019">2019</option>
                        <option value="2020">2020</option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="crop-filter">Crop</label>
                    <i className="filter-icon">🌾</i>
                    <select
                        id="crop-filter"
                        value={filters.crop}
                        onChange={(e) => handleFilterChange('crop', e.target.value)}
                    >
                        <option value="all">All Crops</option>
                        {getUniqueCrops().map(crop => (
                            <option key={crop} value={crop}>{crop}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="region-filter">Region</label>
                    <i className="filter-icon">📍</i>
                    <select
                        id="region-filter"
                        value={filters.region}
                        onChange={(e) => handleFilterChange('region', e.target.value)}
                    >
                        <option value="all">All Regions</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="KPK">KPK</option>
                        <option value="Balochistan">Balochistan</option>
                    </select>
                </div>
                
                <button className="filter-clear" onClick={clearFilters}>
                    Clear Filters
                </button>
            </div>
        </div>
    );
};

export default FiltersPanel; 