import axios from 'axios';
import { Invoice, InvoiceResponse } from '../types';

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

// authService.ts
const authListeners: Array<(isAuth: boolean) => void> = [];

export const authService = {
  login: (email: string, password: string) => {
    if (email === 'admin@gmail.com' && password === 'Admin@123') {
      const fakeToken = 'fake-jwt-token';
      localStorage.setItem('token', fakeToken);
      authListeners.forEach(listener => listener(true));
      return Promise.resolve({ token: fakeToken });
    }
    return Promise.reject(new Error('Invalid credentials'));
  },
  logout: () => {
    localStorage.removeItem('token');
    authListeners.forEach(listener => listener(false));
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
  subscribe: (callback: (isAuth: boolean) => void) => {
    authListeners.push(callback);
    return () => {
      const index = authListeners.indexOf(callback);
      if (index > -1) authListeners.splice(index, 1);
    };
  }
};

export const customerService = {
  getAll: () => api.get('/customers'),
  getMinimal: () => api.get('/customer/minimal'),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers/create-customer', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  // Add delete if needed
};



// services/api.ts
export const invoiceService = {
  getAll: (params?: { customerId?: string, status?: string }) => 
    api.get<InvoiceResponse>('/invoices', { params }),
  
  getById: (id: string) => 
    api.get<Invoice>(`/invoices/${id}`),
  
  create: (data: any) => 
    api.post<Invoice>('/invoices/create-invoice', data),
  
  update: (id: string, data: any) => 
    api.put<Invoice>(`/invoices/${id}`, data),
  
  getPdf: (id: string) => 
    api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  
  send: (id: string, email?: string) => 
    api.post(`/invoices/${id}/send`, email ? { email } : null),
  
  getItems: () => 
    api.get<{ items: any[] }>('/items').then(res => res.data.items || []),
};