

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  wallet: Wallet;
}

export interface Wallet {
  address: string;
  balance: number;
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
