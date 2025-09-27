

import type { ApiResponse, AuthResponse, PaginatedResponse, Transaction, User, Wallet, Balance, FeeEstimation, BuyProvider, BuyFeeCalculation, Order } from '@/lib/types';
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
    const onResponse = (response: AxiosResponse) => {
      // The backend wraps successful responses in a `data` object.
      // We extract it here to simplify data access in the components.
      if (response.data && response.data.success) {
        return { ...response, data: response.data.data };
      }
      // For cases like logout that might just return { success: true }
      if (response.data && response.data.success === true && response.data.data === undefined) {
        return response;
      }
      return response;
    };

    const onError = (error: AxiosError<ApiResponse<any>>) => {
        if (error.code === 'ERR_NETWORK') {
            error.message = 'Network Error: Could not connect to the backend.';
        } else if (error.response?.data?.error) {
            const apiError = error.response.data.error;
            let errorMessage = "An unexpected error occurred.";

            // Attempt to find the most specific error message
            if (apiError.details && typeof apiError.details === 'object' && Object.keys(apiError.details).length > 0) {
                const firstErrorKey = Object.keys(apiError.details)[0];
                const errorValue = apiError.details[firstErrorKey];
                if (Array.isArray(errorValue) && errorValue.length > 0) {
                    errorMessage = errorValue[0];
                } else if (typeof errorValue === 'string') {
                    errorMessage = errorValue;
                }
            } else if (apiError.message) {
                 errorMessage = apiError.message;
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (typeof apiError === 'string') { // Fallback for simple string errors
                errorMessage = apiError;
            }
            
            error.message = errorMessage;
        } else if (error.response?.data?.message) {
             error.message = error.response.data.message;
        }

        return Promise.reject(error);
    };

    instance.interceptors.response.use(onResponse, onError);
}

createResponseInterceptor(axiosInstance);
createResponseInterceptor(publicAxiosInstance);


// Authentication - Use public instance
const login = (credentials: any): Promise<AxiosResponse<AuthResponse>> => publicAxiosInstance.post('auth/login/', credentials);
const register = (userInfo: any): Promise<AxiosResponse<AuthResponse>> => publicAxiosInstance.post('auth/register/', userInfo);
const logout = () => axiosInstance.post('auth/logout/');

// User Profile
const getUserProfile = (): Promise<AxiosResponse<User>> => axiosInstance.get('user/profile/');
const updateUserProfile = (id: number, data: { first_name?: string, last_name?: string }): Promise<AxiosResponse<User>> => axiosInstance.patch(`user/${id}/`, data);
const getUser = (): Promise<AxiosResponse<User>> => axiosInstance.get('user/');


// Wallet
const getWallets = (): Promise<AxiosResponse<Wallet[]>> => axiosInstance.get('wallet/');
const getWalletBalance = (): Promise<AxiosResponse<Balance>> => axiosInstance.get('wallet/balance/');
const generateMnemonic = (): Promise<AxiosResponse<{ mnemonic: string }>> => axiosInstance.post('wallet/generate_mnemonic/');
const createWallet = (mnemonic: string) => axiosInstance.post('wallet/create_wallet/', { mnemonic });
const generateNewAddress = (): Promise<AxiosResponse<{ address: string }>> => axiosInstance.post('wallet/generate_address/');
const generateQrCode = (data: string): Promise<AxiosResponse<{ qr_code: string }>> => axiosInstance.post('wallet/generate_qr_code/', { data });
const restoreWallet = (data: string) => axiosInstance.post('wallet/restore/', { data });
const backupWallet = (): Promise<AxiosResponse<{ wif: string }>> => axiosInstance.get('wallet/backup/');
const estimateFee = (values: { amount: number }): Promise<AxiosResponse<FeeEstimation>> => {
    return axiosInstance.post('wallet/estimate_fee/', {
        amount: values.amount
    });
}


// Transactions
const getTransactions = (): Promise<AxiosResponse<PaginatedResponse<Transaction>>> => axiosInstance.get('transaction/');
const sendTransaction = (values: { recipient: string; amount: number }) => {
    return axiosInstance.post('transaction/send/', {
        to_address: values.recipient,
        amount: values.amount,
    });
};

// Buy / Sell
const getBuyProviders = (): Promise<AxiosResponse<BuyProvider[]>> => axiosInstance.get('providers/buy/');
const calculateBuyFee = (providerId: number, amount: number, currency: string): Promise<AxiosResponse<BuyFeeCalculation>> => {
    return axiosInstance.post('providers/buy/calculate-fee/', { provider_id: providerId, amount, currency });
}
const createOrder = (providerId: number, amount: number, currency: string): Promise<AxiosResponse<Order>> => {
    return axiosInstance.post('orders/', { provider_id: providerId, amount, amount_currency: currency });
}


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
    getBuyProviders,
    calculateBuyFee,
    createOrder,
};

export default api;
