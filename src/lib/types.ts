

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
  btc_value: string;
  sats_value: string;
  usd_value: string;
  bif_value: string;
  last_updated: string;
}

export interface Transaction {
  id: number;
  wallet: number;
  wallet_owner: string;
  txid: string;
  transaction_type: 'internal' | 'receive' | 'send';
  amount: string;
  amount_formatted: string;
  absolute_amount: string;
  fee: string;
  fee_formatted: string;
  service_fee: string;
  service_fee_formatted: string;
  from_address: string | null;
  to_address: string | null;
  status: 'confirmed' | 'pending' | 'failed';
  is_confirmed: boolean;
  confirmations: number;
  raw_tx: string;
  tx_size_bytes: number;
  explorer_url: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface FeeEstimation {
    sendable_btc: string;
    network_fee_btc: string;
    sendable_usd: number;
    sendable_bif: number;
    network_fee_usd: number;
    network_fee_bif: number;
}

export interface BuyProvider {
  id: number;
  name: string;
  logo_url: string;
  description: string;
  currencies: string[];
  payment_info: {
    method: string;
    instructions: string;
  }
}

export interface BuyFeeCalculation {
    amount: string;
    fee: string;
    total_amount: string;
    currency: string;
}

export interface Order {
    id: number;
    provider_id: number;
    amount: string;
    amount_currency: string;
    fee: string;
    total_amount: string;
    status: 'pending' | 'completed' | 'failed' | 'expired';
    // Add other fields as needed
}


export interface ApiErrorDetails {
    [key: string]: string[] | string;
}

export interface ApiError {
    code?: number;
    message?: string;
    details?: ApiErrorDetails;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: ApiError;
    timestamp?: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

    
