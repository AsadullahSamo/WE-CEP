import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Agricultural Data API calls
export const agriculturalAPI = {
    getAllData: (refresh = false) => api.get('/agricultural', { params: { refresh: refresh.toString() } }),
    getDataByYear: (year) => api.get(`/agricultural/year/${year}`),
    getDataByCrop: (crop) => api.get(`/agricultural/crop/${crop}`),
    getDataByRegion: (region) => api.get(`/agricultural/region/${region}`),
    addData: (data) => api.post('/agricultural', data),
    updateData: (id, data) => api.put(`/agricultural/${id}`, data),
    deleteData: (id) => api.delete(`/agricultural/${id}`),
};

// Data Source API calls
export const dataSourceAPI = {
    getWorldBankData: (refresh = false) => api.get('/data-sources/worldbank', { params: { refresh: refresh.toString() } }),
    getUSDAData: (refresh = false) => api.get('/data-sources/usda', { params: { refresh: refresh.toString() } }),
    getOpenDataPakistan: (refresh = false) => api.get('/data-sources/pakistan', { params: { refresh: refresh.toString() } }),
    getAllDataSources: (refresh = false) => api.get('/data-sources/all', { params: { refresh: refresh.toString() } }),
};

// Auth API calls
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/signup', userData),
    verifyToken: () => api.get('/auth/verify-token'),
};

export default api;