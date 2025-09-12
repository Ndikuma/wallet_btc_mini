

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
  balance: number;
  balance_formatted?: string;
  network?: string;
  status?: string;
  wallet_name?: string;
  stats?: WalletStats;
}

export interface Transaction {
  id: string;
  type: "sent" | "received";
  amount: number;
  fee: number;
  status: "completed" | "pending" | "failed";
  date: string;
  address: string;
  recipient?: string;
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
