
import type { ApiResponse, AuthResponse, PaginatedResponse, Transaction, User, Wallet, Balance, FeeEstimation } from '@/lib/types';
import axios, { type AxiosError, type AxiosResponse } from 'axios';

const BACKEND_URL = 'https://knives-resume-handbags-lighting.trycloudflare.com/';

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

const createResponseInterceptor = (instance: typeof axios) => {
    const onResponse = (response: AxiosResponse<ApiResponse<any>>) => {
        // For paginated responses, the actual data is in `results`
        if (response.data?.data && typeof response.data.data === 'object' && 'results' in response.data.data) {
          return { ...response, data: response.data.data.results };
        }
        // For standard data responses
        if (response.data?.data) {
          return { ...response, data: response.data.data };
        }
        // For success responses that might not have a `data` wrapper (like logout)
        if (response.data?.success) {
            return response;
        }
        // Handle cases where `success` is false
        if (response.data && !response.data.success) {
           return Promise.reject(response.data);
        }
        return response;
    };

    const onError = (error: AxiosError<ApiResponse<any>>) => {
        if (error.code === 'ERR_NETWORK') {
            error.message = 'Network Error: Could not connect to the backend.';
        } else if (error.response?.data) {
            const apiMessage = error.response.data.message;
            const apiError = error.response.data.error;
            let errorMessage = "An unexpected error occurred.";

            if (apiError?.details && typeof apiError.details === 'object' && Object.keys(apiError.details).length > 0) {
                const firstErrorKey = Object.keys(apiError.details)[0];
                const errorValue = apiError.details[firstErrorKey];
                if (Array.isArray(errorValue) && errorValue.length > 0) {
                    errorMessage = errorValue[0];
                } else if (typeof errorValue === 'string') {
                    errorMessage = errorValue;
                }
            } else if (apiMessage) {
                errorMessage = apiMessage;
            } else if (typeof apiError === 'string') {
                errorMessage = apiError;
            }

            error.message = errorMessage;
        }
        return Promise.reject(error);
    };

    instance.interceptors.response.use(onResponse, onError);
}

createResponseInterceptor(axiosInstance);
createResponseInterceptor(publicAxiosInstance);


// Authentication - Use public instance
const login = (credentials: any) => publicAxiosInstance.post<AuthResponse>('auth/login/', credentials);
const register = (userInfo: any) => publicAxiosInstance.post<AuthResponse>('auth/register/', userInfo);
const logout = () => axiosInstance.post('auth/logout/');

// User Profile
const getUserProfile = () => axiosInstance.get<User>('user/profile/');
const updateUserProfile = (data: { first_name?: string, last_name?: string }) => axiosInstance.patch<User>('user/profile/', data);
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
const estimateFee = (values: { amount: number }) => {
    return axiosInstance.post<FeeEstimation>('wallet/estimate_fee/', {
        amount: values.amount
    });
}


// Transactions
const getTransactions = () => axiosInstance.get<PaginatedResponse<Transaction>>('transaction/');
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
    updateUserProfile,
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
