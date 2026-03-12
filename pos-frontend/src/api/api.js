import axios from 'axios';

const api = axios.create({
  baseURL: 'https://react-pos-saas-backend.vercel.app/'
});

// AUTO SET TOKEN
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
