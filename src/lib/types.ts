
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
  balance: number | string;
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

export interface ProviderPaymentInfo {
  method: string;
  instructions: string | string[];
  account?: { [key: string]: string };
}

export interface Provider {
  id: number;
  name: string;
  image: string;
  description: string;
  currencies: string[];
  payment_info?: ProviderPaymentInfo;
}

export interface BuyProvider extends Provider {}
export interface SellProvider extends Provider {
  can_sell: boolean;
  currency: string;
}

export interface BuyFeeCalculation {
    amount: string;
    fee: string;
    total_amount: string;
    currency: string;
    btc_amount: string;
}

export interface PayoutData {
    full_name: string;
    phone_number: string;
    account_number: string;
    email?: string;
}

export interface BuyOrderPayload {
    direction: 'buy';
    provider_id: number;
    amount: number;
    amount_currency: string;
    btc_amount: number;
}

export interface SellOrderPayload {
    direction: 'sell';
    provider_id: number;
    amount: number;
    btc_amount: number;
    amount_currency: string;
    payout_data: PayoutData;
    total_amount: string;
}

export interface OrderUpdatePayload {
  payment_proof?: {
    tx_id: string;
    image_base64: string | null;
  };
  note?: string | null;
  status?: 'awaiting_confirmation';
}


export interface Order {
    id: number;
    user: string;
    provider: BuyProvider;
    provider_id: number;
    direction: 'buy' | 'sell';
    amount_currency: string;
    amount: string;
    fee: string;
    total_amount: string;
    payment_proof: { [key: string]: any };
    status: 'pending' | 'awaiting_confirmation' | 'completed' | 'failed';
    note: string | null;
    btc_address: string | null;
    btc_amount: string | null;
    btc_txid: string | null;
    created_at: string;
    updated_at: string;
    payout_data?: PayoutData;
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
