
import type { ApiResponse, AuthResponse, PaginatedResponse, Transaction, User, Wallet, Balance, FeeEstimation } from '@/lib/types';
import axios, { type AxiosError, type AxiosResponse } from 'axios';

const BACKEND_URL = 'https://forums-emails-counter-jewelry.trycloudflare.com/';

// Main instance for authenticated requests
const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public instance for requests that should NOT send a token
const publicAxiosInstance = axios.create({
  baseURL: BACKEND_URL,
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

const createResponseInterceptor = (instance: typeof axiosInstance) => {
    instance.interceptors.response.use(
        (response: AxiosResponse<ApiResponse<any>>) => {
            if (response.data && response.data.success) {
                // For paginated responses, the actual data is in `results`
                if (response.data.data && typeof response.data.data === 'object' && 'results' in response.data.data) {
                    return { ...response, data: response.data.data.results };
                }
                 // For standard data responses
                if (response.data.data) {
                    return { ...response, data: response.data.data };
                }
            }
            return response;
        },
        (error: AxiosError<ApiResponse<any>>) => {
            return Promise.reject(error);
        }
    );
}

createResponseInterceptor(axiosInstance);
createResponseInterceptor(publicAxiosInstance);


// Authentication - Use public instance
const login = (credentials: any) => publicAxiosInstance.post<AuthResponse>('auth/login/', credentials);
const register = (userInfo: any) => publicAxiosInstance.post<AuthResponse>('auth/register/', userInfo);
const logout = () => axiosInstance.post('auth/logout/');

// User Profile
const getUserProfile = () => axiosInstance.get<User>('user/profile/');
const getUser = () => axiosInstance.get<User>('user/');


// Wallet
const getWallets = () => axiosInstance.get<Wallet[]>('wallet/');
const getWalletBalance = () => axiosInstance.get<Balance>('wallet/balance/');
const generateMnemonic = () => axiosInstance.post<{ mnemonic: string }>('wallet/generate_mnemonic/');
const createWallet = (mnemonic: string) => axiosInstance.post('wallet/create_wallet/', { mnemonic });
const generateNewAddress = () => axiosInstance.post<{ address: string }>('wallet/generate_address/');
const generateQrCode = (data: string) => axiosInstance.post<{ qr_code: string }>('wallet/generate_qr_code/', { data });
const restoreWallet = (data: string) => axiosInstance.post('wallet/restore/', { data });
const backupWallet = () => axiosInstance.get<{ wif: string }>('wallet/backup/');
const estimateFee = (values: { recipient: string, amount: number }) => {
    return axiosInstance.post<FeeEstimation>('wallet/estimate-fee/', {
        to_address: values.recipient,
        amount: values.amount
    });
}


// Transactions
const getTransactions = () => {
    return axiosInstance.get<Transaction[]>('transaction/');
};
const sendTransaction = (values: { recipient: string; amount: number }) => {
    return axiosInstance.post('transaction/send/', {
        to_address: values.recipient,
        amount: values.amount,
    });
};


const api = {
    login,
    register,
    logout,
    getUserProfile,
    getUser,
    getWallets,
    getWalletBalance,
    generateMnemonic,
    createWallet,
    generateNewAddress,
    generateQrCode,
    restoreWallet,
    backupWallet,
    getTransactions,
    sendTransaction,
    estimateFee,
};

export default api;
