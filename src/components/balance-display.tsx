
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Balance } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { AxiosError } from "axios";

interface BalanceDisplayProps {
  isVisible: boolean;
}

export function BalanceDisplay({ isVisible }: BalanceDisplayProps) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      setLoading(true);
      setError(null);
      try {
        const balanceRes = await api.getWalletBalance();
        setBalance(balanceRes.data);
      } catch (err: any) {
        if (err instanceof AxiosError && err.code === 'ERR_NETWORK') {
            setError("Network error. Please check your connection.");
        } else if (err instanceof AxiosError && err.response?.status === 403) {
          setError("Wallet is being set up...");
        } else {
          console.error("Failed to fetch balance data", err);
          setError("Could not load balance.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchBalance();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 pt-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="size-4" />
        <span>{error}</span>
      </div>
    );
  }
  
  if (!balance) return null;

  const hiddenBalance = "********";

  return (
    <div className="w-full space-y-4">
      <p className="text-3xl sm:text-4xl font-bold tracking-tight">
        {isVisible ? balance.usd_value : hiddenBalance}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
        <div className="space-y-1">
            <p className="font-medium">{isVisible ? balance.btc_value : hiddenBalance}</p>
        </div>
        <div className="space-y-1">
            <p className="font-medium">{isVisible ? balance.sats_value : hiddenBalance}</p>
        </div>
        <div className="space-y-1">
             <p className="font-medium">{isVisible ? balance.bif_value : hiddenBalance}</p>
        </div>
      </div>
    </div>
  );
}
