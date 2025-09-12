
import type { ApiResponse, AuthResponse, PaginatedResponse, Transaction, User, Wallet, Balance } from '@/lib/types';
import axios, { type AxiosError, type AxiosResponse } from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // Using relative URL to leverage Next.js proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
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

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    if (response.data && response.data.success) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error: AxiosError<ApiResponse<any>>) => {
    return Promise.reject(error);
  }
);


// Authentication
const login = (credentials: any) => axiosInstance.post<AuthResponse>('/auth/login/', credentials);
const register = (userInfo: any) => axiosInstance.post<AuthResponse>('/auth/register/', userInfo);
const logout = () => axiosInstance.post('/auth/logout/');

// User Profile
const getUserProfile = () => axiosInstance.get<User>('/user/profile/');
const getUser = () => axiosInstance.get<User>('/user/');


// Wallet
const getWallets = () => axiosInstance.get<Wallet[]>('/wallet/');
const getWalletBalance = () => axiosInstance.get<Balance>('/wallet/balance/');
const generateMnemonic = () => axiosInstance.post<{ mnemonic: string }>("/wallet/generate_mnemonic/");
const generateNewAddress = () => axiosInstance.post<{ address: string }>("/wallet/generate_address/");
const generateQrCode = (data: string) => axiosInstance.post<{ qr_code: string }>('/wallet/generate_qr_code/', { data });
const restoreWallet = (mnemonic: string) => axiosInstance.post('/wallet/restore/', { mnemonic });


// Transactions
const getTransactions = (limit?: number) => axiosInstance.post<PaginatedResponse<Transaction>>('/transaction/', { limit });
const sendTransaction = (values: any) => axiosInstance.post('/transaction/send/', values);


const api = {
    login,
    register,
    logout,
    getUserProfile,
    getUser,
    getWallets,
    getWalletBalance,
    generateMnemonic,
    generateNewAddress,
    generateQrCode,
    restoreWallet,
    getTransactions,
    sendTransaction
};

export default api;
