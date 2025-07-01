import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email: string, password: string) => {
    // Static login for demo
    if (email === 'admin@gmail.com' && password === 'Admin@123') {
      const fakeToken = 'fake-jwt-token';
      localStorage.setItem('token', fakeToken);
      return Promise.resolve({ token: fakeToken });
    }
    return Promise.reject(new Error('Invalid credentials'));
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const customerService = {
  getAll: () => api.get('/customers'),
  getMinimal: () => api.get('/customer/minimal'),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers/create-customer', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  // Add delete if needed
};