
import type { ApiResponse, AuthResponse, PaginatedResponse, Transaction, User, Wallet, Balance, FeeEstimation, BuyProvider, BuyFeeCalculation, Order, SellProvider, BuyOrderPayload, SellOrderPayload } from '@/lib/types';
import axios, { type AxiosError, type AxiosResponse, type AxiosInstance } from 'axios';

const BACKEND_URL = 'https://featuring-shipped-pastor-amenities.trycloudflare.com/';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

const createResponseInterceptor = (instance: AxiosInstance) => {
    const onResponse = (response: AxiosResponse) => {
      if (response.data && response.data.success) {
        return { ...response, data: response.data.data };
      }
      if (response.data && response.data.success === true && response.data.data === undefined) {
        return response;
      }
      return response;
    };

    const onError = (error: AxiosError<ApiResponse<any>>) => {
        let errorMessage = "An unexpected error occurred. Please try again later.";
        
        if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Could not connect to the server. The service may be starting up. Please wait a moment and try again.';
        } else if (error.response?.data) {
            const responseData = error.response.data;
            const apiError = responseData.error;
            const apiMessage = responseData.message;

            if (apiError) {
                 if (apiError.message?.includes("Invalid token")) {
                    errorMessage = apiError.message;
                 } else if (apiError.details && typeof apiError.details === 'object' && Object.keys(apiError.details).length > 0) {
                    const firstErrorKey = Object.keys(apiError.details)[0];
                    const errorValue = apiError.details[firstErrorKey];
                    if (Array.isArray(errorValue) && errorValue.length > 0) {
                        errorMessage = errorValue[0];
                    } else if (typeof errorValue === 'string') {
                        errorMessage = errorValue;
                    } else if (apiError.message) {
                        errorMessage = apiError.message;
                    }
                } else if (apiError.message) {
                    errorMessage = apiError.message;
                } else if (typeof apiError === 'string') {
                    errorMessage = apiError;
                }
            } else if (apiMessage) {
                errorMessage = apiMessage;
            }
        }
        
        error.message = errorMessage;
        return Promise.reject(error);
    };

    instance.interceptors.response.use(onResponse, onError);
}

createResponseInterceptor(axiosInstance);
createResponseInterceptor(publicAxiosInstance);

const login = (credentials: any): Promise<AxiosResponse<AuthResponse>> => publicAxiosInstance.post('auth/login/', credentials);
const register = (userInfo: any): Promise<AxiosResponse<AuthResponse>> => publicAxiosInstance.post('auth/register/', userInfo);
const logout = () => axiosInstance.post('auth/logout/');

const getUserProfile = (): Promise<AxiosResponse<User>> => axiosInstance.get('user/profile/');
const updateUserProfile = (id: number, data: { first_name?: string, last_name?: string }): Promise<AxiosResponse<User>> => axiosInstance.patch(`user/${id}/`, data);
const getUser = (): Promise<AxiosResponse<User>> => axiosInstance.get('user/');

const getWallets = (): Promise<AxiosResponse<Wallet[]>> => axiosInstance.get('wallet/');
const getWalletBalance = (): Promise<AxiosResponse<Balance>> => axiosInstance.get('wallet/balance/');
const generateMnemonic = (): Promise<AxiosResponse<{ mnemonic: string }>> => axiosInstance.post('wallet/generate_mnemonic/');
const createWallet = (mnemonic: string) => axiosInstance.post('wallet/create_wallet/', { mnemonic });
const generateNewAddress = (): Promise<AxiosResponse<{ address: string }>> => axiosInstance.post('wallet/generate_address/');
const generateQrCode = (data: string): Promise<AxiosResponse<{ qr_code: string }>> => axiosInstance.post('wallet/generate_qr_code/', { data });
const restoreWallet = (data: string): Promise<AxiosResponse<AuthResponse>> => axiosInstance.post('wallet/restore/', { data });
const backupWallet = (): Promise<AxiosResponse<{ wif: string }>> => axiosInstance.get('wallet/backup/');

const estimateFee = (payload: { amount: string }): Promise<AxiosResponse<FeeEstimation>> => {
    return axiosInstance.post('wallet/estimate_fee/', payload);
}

const getTransactions = (): Promise<AxiosResponse<PaginatedResponse<Transaction>>> => axiosInstance.get('transaction/');
const getRecentTransactions = (): Promise<AxiosResponse<Transaction[]>> => axiosInstance.get('transaction/recents/');
const sendTransaction = (values: { to_address: string; amount: string }) => {
    return axiosInstance.post('transaction/send/', values);
};

const getBuyProviders = (): Promise<AxiosResponse<BuyProvider[]>> => axiosInstance.get('providers/buy/');
const getSellProviders = (): Promise<AxiosResponse<SellProvider[]>> => axiosInstance.get('providers/sell/');
const calculateBuyFee = (providerId: number, amount: number, currency: string): Promise<AxiosResponse<BuyFeeCalculation>> => {
    return axiosInstance.post('providers/buy/calculate-fee/', { provider_id: providerId, amount: String(amount), currency });
}

const createBuyOrder = (payload: BuyOrderPayload): Promise<AxiosResponse<Order>> => {
    return axiosInstance.post('orders/', { ...payload, direction: 'buy' });
}
const createSellOrder = (payload: SellOrderPayload): Promise<AxiosResponse<Order>> => {
    return axiosInstance.post('orders/', { ...payload, direction: 'sell' });
}

const getOrders = (): Promise<AxiosResponse<PaginatedResponse<Order>>> => axiosInstance.get('orders/');
const getOrder = (orderId: number): Promise<AxiosResponse<Order>> => axiosInstance.get(`orders/${orderId}/`);
const updateOrder = (orderId: number, data: { payment_proof?: any; note?: string | null }): Promise<AxiosResponse<Order>> => {
    return axiosInstance.patch(`orders/${orderId}/`, data);
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
    getRecentTransactions,
    sendTransaction,
    estimateFee,
    getBuyProviders,
    getSellProviders,
    calculateBuyFee,
    createBuyOrder,
    createSellOrder,
    getOrders,
    getOrder,
    updateOrder,
};

export default api;
