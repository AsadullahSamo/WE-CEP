import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserX, ChevronDown } from 'lucide-react';
import StatisticalSummary from './StatisticalSummary';
import TrendAnalysis from './TrendAnalysis';
import AgriculturalDataTable from './AgriculturalDataTable';
import FiltersPanel from './FiltersPanel';
import { agriculturalAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import ProductionChart from './ProductionChart';

const Dashboard = () => {
    const [agriculturalData, setAgriculturalData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        searchQuery: '',
        year: 'all',
        crop: 'all',
        region: 'all'
    });

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    // Apply filters whenever they change
    useEffect(() => {
        applyFilters();
    }, [filters, agriculturalData]);

    // Fetch data from API
    const fetchData = async (refresh = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await agriculturalAPI.getAllData(refresh);
            const data = response.data;
            
            if (data && Array.isArray(data)) {
                setAgriculturalData(data);
                setFilteredData(data);
            } else {
                throw new Error('Invalid data format received');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load agricultural data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh data
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const response = await agriculturalAPI.getAllData(true);
            const data = response.data;
            
            if (data && Array.isArray(data)) {
                setAgriculturalData(data);
                // Filters will be applied by the useEffect
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            setError('Failed to refresh data. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Apply filters to the data
    const applyFilters = () => {
        if (!agriculturalData || agriculturalData.length === 0) {
            setFilteredData([]);
            return;
        }

        let result = [...agriculturalData];
        
        // Apply search query filter
        if (filters.searchQuery.trim()) {
            const search = filters.searchQuery.toLowerCase().trim();
            result = result.filter(item => 
                (item.crop && item.crop.toLowerCase().includes(search)) ||
                (item.region && item.region.toLowerCase().includes(search)) ||
                (item.source && item.source.toLowerCase().includes(search))
            );
        }
        
        // Apply year filter
        if (filters.year !== 'all') {
            result = result.filter(item => item.year === filters.year);
        }
        
        // Apply crop filter
        if (filters.crop !== 'all') {
            result = result.filter(item => item.crop === filters.crop);
        }
        
        // Apply region filter
        if (filters.region !== 'all') {
            result = result.filter(item => item.region === filters.region);
        }
        
        setFilteredData(result);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            const success = await deleteAccount();
            if (success) {
                navigate('/login');
            }
        }
    };

    return (
        <div className={`dashboard ${isRefreshing ? 'refreshing' : ''}`}>
            <div className="dashboard-header">
                <div className="user-menu">
                    <button 
                        className="user-menu-trigger"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <span>{user?.username}</span>
                        <ChevronDown size={16} />
                    </button>
                    {showUserMenu && (
                        <div className="user-menu-dropdown">
                            <button onClick={handleLogout} className="menu-item">
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                            <button onClick={handleDeleteAccount} className="menu-item delete">
                                <UserX size={16} />
                                <span>Delete Account</span>
                            </button>
                        </div>
                    )}
                </div>
                <div className="header-content">
                    <h1>Agricultural Data Dashboard</h1>
                    <p>Comprehensive analysis of crop production, area, and yields across different regions</p>
                </div>
            </div>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            <FiltersPanel filters={filters} setFilters={setFilters} />
            

            

            <div className="dashboard-stats">
                <StatisticalSummary data={filteredData} isRefreshing={isRefreshing} />
            </div>

            <div className="dashboard-stats">
                <ProductionChart data={filteredData} isRefreshing={isRefreshing} />
            </div>
            
            <div className="dashboard-trends">
                <TrendAnalysis data={filteredData} isRefreshing={isRefreshing} />
            </div>


            
            <div className="dashboard-table">
                <AgriculturalDataTable 
                    data={filteredData} 
                    isLoading={isLoading} 
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                />
            </div>
        </div>
    );
};

export default Dashboard;