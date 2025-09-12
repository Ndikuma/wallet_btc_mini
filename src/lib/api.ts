
import type { ApiResponse } from '@/lib/types';
import axios, { type AxiosError, type AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://damaged-gabriel-huntington-lenses.trycloudflare.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
  // Unwrap the data from the custom API response on success
  (response: AxiosResponse<ApiResponse<any>>) => {
    // If the backend indicates success, return a response object with just the data.
    if (response.data && response.data.success) {
      // The actual payload is inside the 'data' property of the response body
      return { ...response, data: response.data.data };
    }
    // If 'success' is not explicitly true, it might be an issue or a different response structure.
    return response;
  },
  (error: AxiosError<ApiResponse<any>>) => {
    // For errors, we pass the original error object along.
    // The error structure can be accessed in the .catch() block of the API call.
    // e.g., error.response.data.error.details
    return Promise.reject(error);
  }
);


export default api;
