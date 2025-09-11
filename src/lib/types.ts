export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
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
