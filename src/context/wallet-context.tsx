
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '@/lib/api';
import type { Balance } from '@/lib/types';
import { AxiosError } from 'axios';
import { usePathname, useRouter } from 'next/navigation';

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
  const router = useRouter();

  const fetchBalance = useCallback(async () => {
    // This function will only be called on authenticated routes,
    // so we can be more direct with our logic.
    setIsLoading(true);
    setError(null);
    try {
      const balanceRes = await api.getWalletBalance();
      setBalance(balanceRes.data);
    } catch (err: any) {
        if (err instanceof AxiosError && (err.response?.status === 401)) {
            // The token is invalid. Clear it and let the UI react.
            // DO NOT redirect here to avoid race conditions.
            localStorage.removeItem("authToken");
            document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setError("Session invalide. Veuillez vous reconnecter.");
            router.push('/login'); // Redirect on the client-side to be safe.
        } else if (err instanceof AxiosError && err.response?.status === 403) {
             setError("Votre portefeuille est en cours de configuration. Cela peut prendre un moment. Veuillez essayer d'actualiser dans quelques secondes.");
        } else {
            setError(err.message || "Impossible de charger le solde.");
        }
        console.error("Failed to fetch balance data", err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const isPublicPage = ['/login', '/register', '/', '/restore-wallet', '/create-wallet', '/verify-mnemonic', '/create-or-restore'].includes(pathname);
    const token = typeof window !== "undefined" ? localStorage.getItem('authToken') : null;

    if (token && !isPublicPage) {
        fetchBalance();
    } else {
        // If we're on a public page or have no token, we are not loading balance data.
        // If we somehow land on a private page with no token, protected route logic should handle it.
        setIsLoading(false);
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
