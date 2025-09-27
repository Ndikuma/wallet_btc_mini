
import type { ApiResponse, AuthResponse, PaginatedResponse, Transaction, User, Wallet, Balance, FeeEstimation } from '@/lib/types';
import axios, { type AxiosError, type AxiosResponse } from 'axios';

const BACKEND_URL = 'https://atlas-thy-adaptation-thus.trycloudflare.com/';

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
    const onResponse = (response: AxiosResponse<ApiResponse<any>>) => {
        if (response.data && response.data.success) {
            // For paginated responses, the actual data is in `results`
            if (response.data.data && typeof response.data.data === 'object' && response.data.data !== null && 'results' in response.data.data) {
                return { ...response, data: response.data.data.results };
            }
             // For standard data responses
            if (response.data.data) {
                return { ...response, data: response.data.data };
            }
        }
        // Handle cases where `success` is true but `data` is not present, or success is false
        if (response.data && !response.data.success) {
           return Promise.reject(response.data);
        }
        return response;
    };

    const onError = (error: AxiosError<ApiResponse<any>>) => {
        if (error.code === 'ERR_NETWORK') {
            error.message = 'Network Error: Could not connect to the backend.';
        } else if (error.response?.data) {
            const apiError = error.response.data.error;
            const apiMessage = error.response.data.message;
            let errorMessage = "An unknown error occurred.";
            if (apiMessage) {
                errorMessage = apiMessage;
            } else if (apiError && typeof apiError.details === 'object' && apiError.details !== null) {
                // Extract first error message from details object
                const firstErrorKey = Object.keys(apiError.details)[0];
                if (firstErrorKey && Array.isArray(apiError.details[firstErrorKey]) && apiError.details[firstErrorKey].length > 0) {
                    errorMessage = apiError.details[firstErrorKey][0];
                } else {
                    errorMessage = typeof apiError === 'string' ? apiError : errorMessage;
                }
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
