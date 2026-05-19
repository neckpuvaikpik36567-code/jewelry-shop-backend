// Базовая конфигурация API
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  },
  
  auth: {
    login: (data) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  }
};