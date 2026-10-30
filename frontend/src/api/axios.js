import axios from 'axios';

let apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://campus-accessibility-backend.onrender.com/api' : 'http://localhost:5000/api');

// Auto-correct typo if Vercel has 'campus-accessibility-reporter.onrender.com'
if (apiBase && apiBase.includes('campus-accessibility-reporter.onrender.com')) {
  apiBase = apiBase.replace('campus-accessibility-reporter.onrender.com', 'campus-accessibility-backend.onrender.com');
}

const api = axios.create({
  baseURL: apiBase
});

// Attach the stored JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, the backend returns 401 — clear
// stale auth state so the app doesn't sit in a broken logged-in state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
