

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
  fee_percent?: number;
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

// --- Order Creation Payloads ---

export interface OnChainBuyOrderPayload {
    direction: 'buy';
    payment_method: 'on_chain';
    provider_id: number;
    amount: number;
    amount_currency: string;
    btc_amount: number;
}

export interface OnChainSellOrderPayload {
    direction: 'sell';
    payment_method: 'on_chain';
    provider_id: number;
    amount: number; // This is BTC amount from user input
    btc_amount: number; // This is the final BTC amount after fees
    amount_currency: string;
    payout_data: PayoutData;
    total_amount: string; // The fiat value user will receive
}

export interface LightningBuyOrderPayload {
    direction: 'buy';
    payment_method: 'lightning';
    ln_amount_sats: number;
    memo?: string;
}

export interface LightningSellOrderPayload {
    direction: 'sell';
    payment_method: 'lightning';
    ln_invoice: string;
}

export type OrderPayload = OnChainBuyOrderPayload | OnChainSellOrderPayload | LightningBuyOrderPayload | LightningSellOrderPayload;


export interface OrderUpdatePayload {
  payment_proof?: {
    tx_id: string;
    image_base64: string | null;
  };
  note?: string | null;
  status?: 'awaiting_confirmation';
}

export interface OrderBase {
  id: number;
  user: string;
  provider: Provider;
  provider_id?: number;
  amount_currency: string;
  amount: string;
  fee: string;
  total_amount: string;
  payment_proof?: { [key: string]: any } | null;
  status: "pending" | "awaiting_confirmation" | "completed" | "failed" | "cancelled";
  note?: string | null;
  direction: "buy" | "sell";
  payout_data?: Record<string, any> | string | null;
  payment_method: "on_chain" | "lightning";
  created_at: string;
  updated_at: string;
}

export interface OnChainOrder extends OrderBase {
  payment_method: "on_chain";
  btc_address?: string | null;
  btc_amount?: string | null;
  btc_txid?: string | null;
}

export interface LightningOrder extends OrderBase {
  payment_method: "lightning";
  ln_invoice?: string | null;
  ln_amount_sats?: number | null;
  ln_payment_hash?: string | null;
  ln_paid_at?: string | null;
}

export type Order = OnChainOrder | LightningOrder;


// Lightning Network Types
export interface LightningBalance {
  balance: number;
  currency: string;
  balance_usd?: number;
  balance_bif?: number;
}

export interface LightningInvoice {
  payment_hash: string;
  bolt11: string;
  amount_sats: number;
  memo: string | null;
  status: 'pending' | 'paid' | 'expired';
  created_at: string;
  expires_at: string;
  qr_code: string;
}

export interface CreateInvoicePayload {
  amount: number;
  memo?: string;
}

export interface LightningPayment {
  payment_hash: string;
  status: 'succeeded' | 'failed' | 'pending';
  fee_sats: number;
  message?: string;
  created_at: string;
}

export interface PayLightningRequestPayload {
  request: string;
  amount_sats?: number;
  type: 'invoice' | 'lnurl' | 'ln_address';
  internal: boolean;
}

export interface DecodedLightningRequest {
  type: 'invoice' | 'lnurl' | 'ln_address';
  amount_sats: number | null;
  amount_usd?: number;
  amount_bif?: number;
  fee_sats?: number;
  memo?: string | null;
  payee_pubkey?: string | null;
  expires_at?: string | null;
  internal: boolean;
  status?: 'unpaid' | 'paid' | 'cancelled' | 'expired';
  created_at?: string | null;
  payment_hash?: string | null;
}

export interface DecodeLightningRequestPayload {
    request: string;
}


export interface LightningTransaction {
  type: 'incoming' | 'outgoing';
  amount_sats: number;
  fee_sats: number;
  memo: string | null;
  status: 'succeeded' | 'failed' | 'pending' | 'paid' | 'expired';
  created_at: string;
  payment_hash: string;
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
