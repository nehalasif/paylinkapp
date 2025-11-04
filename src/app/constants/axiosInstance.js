import axios from 'axios';


export const createAxiosInstance = ({ baseURL, token }) => {
    const axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  
    // Request interceptor for adding Authorization header
    axiosInstance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  
    // Response interceptor for handling errors globally
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API error:', error);
        return Promise.reject(error);
      }
    );
  
    return axiosInstance;
  };
