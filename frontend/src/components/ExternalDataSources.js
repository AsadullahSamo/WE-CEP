import React from 'react';
import './ExternalDataSources.css';

const ExternalDataSources = ({ data, isRefreshing }) => {
    // Group data by source
    const groupedData = data.reduce((acc, item) => {
        const source = item.source;
        if (!acc[source]) {
            acc[source] = [];
        }
        acc[source].push(item);
        return acc;
    }, {});

    // Count records by source
    const sourceStats = Object.keys(groupedData).map(source => {
        const sourceData = groupedData[source];
        const recordCount = sourceData.length;
        const latestYear = Math.max(...sourceData.map(item => parseInt(item.year)));
        const uniqueCrops = new Set(sourceData.map(item => item.crop)).size;
        const uniqueRegions = new Set(sourceData.map(item => item.region)).size;
        
        return {
            source,
            recordCount,
            latestYear,
            uniqueCrops,
            uniqueRegions
        };
    });

    return (
        <div className="external-data-sources">
            {isRefreshing && (
                <div className="refreshing-overlay">
                    <div className="refreshing-spinner"></div>
                    <div>Updating external sources...</div>
                </div>
            )}
            
            <h2>External Data Sources</h2>
            
            {sourceStats.length === 0 ? (
                <div className="no-data">No external data sources available</div>
            ) : (
                <div className="data-sources-container">
                    {sourceStats.map((stat, index) => (
                        <div className="data-source-card" key={index}>
                            <div className="data-source-header">
                                <h3>
                                    {stat.source === 'World Bank' && <span className="source-icon">🏦</span>}
                                    {stat.source === 'USDA' && <span className="source-icon">🌽</span>}
                                    {stat.source === 'Open Data Pakistan' && <span className="source-icon">🌾</span>}
                                    {stat.source}
                                </h3>
                                <div className="record-count">
                                    {stat.recordCount} records
                                </div>
                            </div>
                            
                            <div className="data-source-details">
                                <div className="detail-item">
                                    <span className="detail-label">Latest Year:</span>
                                    <span className="detail-value">{stat.latestYear}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Crop Types:</span>
                                    <span className="detail-value">{stat.uniqueCrops}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Regions:</span>
                                    <span className="detail-value">{stat.uniqueRegions}</span>
                                </div>
                                <div className="detail-item source-description">
                                    {stat.source === 'World Bank' && (
                                        <p>World Bank provides agricultural data at country level, focusing on overall production metrics and economic indicators.</p>
                                    )}
                                    {stat.source === 'USDA' && (
                                        <p>USDA provides detailed agricultural data including production, area harvested, and yield information for various crops across regions.</p>
                                    )}
                                    {stat.source === 'Open Data Pakistan' && (
                                        <p>Open Data Pakistan provides comprehensive agricultural statistics directly from Pakistan's government sources, with detailed regional breakdowns.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExternalDataSources;