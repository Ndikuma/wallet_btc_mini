

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  wallet_created?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  wallet: Wallet;
}

export interface WalletStats {
    total_transactions: number;
    sent_transactions: number;
    received_transactions: number;
    total_sent: number;
    total_received: number;
    current_balance: number;
    wallet_age_days: number;
}

export interface Wallet {
  id?: number;
  address: string;
  primary_address?: string;
  balance: number | string; // Can be string from some endpoints
  balance_formatted?: string;
  network?: string;
  status?: string;
  wallet_name?: string;
  stats?: WalletStats;
}

export interface Balance {
  id: number;
  wallet_name: string;
  bitcoin_address: string;
  balance: string;
  btc_value: number;
  sats_value: number;
  usd_value: number;
  bif_value: number;
  last_updated: string;
}

export interface Transaction {
  id: number;
  txid: string;
  transaction_type: 'internal' | 'receive' | 'send';
  amount: string;
  amount_formatted: string;
  fee: string;
  status: 'confirmed' | 'pending' | 'failed';
  is_confirmed: boolean;
  confirmations: number;
  explorer_url: string;
  created_at: string;
  updated_at: string;
  from_address?: string;
  to_address?: string;
}

export interface ApiErrorDetails {
    [key: string]: string[] | string;
}

export interface ApiError {
    code: number;
    message: string;
    details: ApiErrorDetails;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    error?: ApiError;
    timestamp?: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

    