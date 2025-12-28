// API configuration and utility functions
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage or cookie
const getToken = () => {
  return localStorage.getItem('token');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),

  getCurrentUser: () => apiRequest('/auth/me'),

  forgotPassword: (email) => apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  resetPassword: (token, password) => apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }),
};

// PDF API
export const pdfAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/pdfs?${queryString}`);
  },

  getById: (id) => apiRequest(`/pdfs/${id}`),

  getLanguages: () => apiRequest('/pdfs/languages/list'),

  create: async (formData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/pdfs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create PDF');
    }
    return data;
  },

  update: async (id, formData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/pdfs/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update PDF');
    }
    return data;
  },

  delete: (id) => apiRequest(`/pdfs/${id}`, {
    method: 'DELETE',
  }),
};

// Order API
export const orderAPI = {
  createCheckoutSession: (pdfId) => apiRequest('/orders/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ pdfId }),
  }),

  verifyPayment: (sessionId) => apiRequest('/orders/verify-payment', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  }),

  getMyOrders: () => apiRequest('/orders/my-orders'),
};

// Download API
export const downloadAPI = {
  getDownloadUrl: (pdfId) => apiRequest(`/download/${pdfId}`),
};

