import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getAll: (params = {}) => api.get('/inventory', { params }),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get('/inventory', { params: { low_stock: true } }),
};

// Warehouses API
export const warehousesAPI = {
  getAll: () => api.get('/warehouses'),
  create: (data) => api.post('/warehouses', data),
  update: (id, data) => api.put(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`),
};

// Forecasting API
export const forecastingAPI = {
  generateForecast: (data) => api.post('/forecasting/demand', data),
  getHistory: (params = {}) => api.get('/forecasting/history', { params }),
};

// Anomalies API
export const anomaliesAPI = {
  getAll: (params = {}) => api.get('/anomalies', { params }),
  resolve: (id) => api.post(`/anomalies/${id}/resolve`),
  getSettings: () => api.get('/anomalies/settings'),
};

// Data Upload API
export const dataAPI = {
  uploadFile: (file, dataType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data_type', dataType);
    return api.post('/data/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getSources: () => api.get('/data/sources'),
  scheduleImport: (data) => api.post('/data/schedule', data),
};

// Chat API
export const chatAPI = {
  streamChat: async (prompt, apiKey) => {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey ? `Bearer ${apiKey}` : undefined,
      },
      body: JSON.stringify({ prompt }),
    });
    return response;
  },
};

// Object Detection API
export const detectionAPI = {
  detectObjects: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    });
  },
};

// Reports API
export const reportsAPI = {
  getInventoryReport: (params = {}) => api.get('/reports/inventory', { params }),
  getForecastReport: (params = {}) => api.get('/reports/forecasts', { params }),
  exportCSV: (data) => api.post('/export/csv', data, { responseType: 'blob' }),
  exportPDF: (data) => api.post('/export/pdf', data, { responseType: 'blob' }),
};

export default api;