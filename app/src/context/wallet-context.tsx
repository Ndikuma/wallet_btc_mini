
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '@/lib/api';
import type { Balance } from '@/lib/types';
import { AxiosError } from 'axios';
import { usePathname } from 'next/navigation';

interface WalletContextType {
  balance: Balance | null;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const fetchBalance = useCallback(async () => {
    // This provider only wraps authenticated routes, so we expect a token.
    setIsLoading(true);
    setError(null);
    try {
      const balanceRes = await api.getWalletBalance();
      setBalance(balanceRes.data);
    } catch (err: any) {
        if (err instanceof AxiosError && (err.response?.status === 401)) {
            // Invalid token. Clean up state but DO NOT redirect here to avoid server/client race conditions.
            // Let protected routes handle redirection on the next navigation attempt.
            if (typeof window !== 'undefined') {
                localStorage.removeItem("authToken");
                document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }
            setError("Session invalide. Veuillez vous reconnecter.");
        } else if (err instanceof AxiosError && err.response?.status === 403) {
             setError("Votre portefeuille est en cours de configuration. Cela peut prendre un moment. Veuillez essayer d'actualiser dans quelques secondes.");
        } else {
            setError(err.message || "Impossible de charger le solde.");
        }
        console.error("Failed to fetch balance data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if there is a token. This check makes it safer for SSR.
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
        fetchBalance();
    } else {
        // If there's no token, we can assume the user is not logged in.
        // The middleware or page logic should handle redirection if necessary.
        setIsLoading(false);
        setError("Non authentifié.");
    }
  }, [fetchBalance, pathname]);

  return (
    <WalletContext.Provider value={{ balance, isLoading, error, refreshBalance: fetchBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
