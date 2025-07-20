import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    // You can add more default config here
});

// Add a request interceptor (for future use, e.g., tokens)
api.interceptors.request.use(
    (config) => {
        // You can add headers or logging here
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor (optional, for error handling/logging)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // You can handle errors globally here
        return Promise.reject(error);
    }
);

export default api; 