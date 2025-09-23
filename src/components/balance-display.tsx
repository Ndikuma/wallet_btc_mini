
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Balance } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Bitcoin } from "lucide-react";
import { AxiosError } from "axios";
import { cn } from "@/lib/utils";

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
        if (err instanceof AxiosError && err.response?.status === 403) {
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
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
  
  const btcValue = typeof balance.btc_value === 'number' ? balance.btc_value : parseFloat(balance.btc_value);

  return (
    <div className="font-mono w-full space-y-4">
        {/* Primary USD Display */}
        <p className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isVisible ? `$${Number(balance.usd_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : hiddenBalance}
        </p>

        {/* Secondary BTC Display */}
        <div className="flex items-baseline gap-2">
          <Bitcoin className="size-5 text-muted-foreground" />
          <p className="text-lg sm:text-xl font-medium">
              {isVisible ? `${btcValue.toFixed(8)} BTC` : hiddenBalance}
          </p>
        </div>

      {/* Additional Units */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2 text-sm text-muted-foreground">
         <div className="space-y-1">
            <p className="font-semibold text-base text-foreground">
              {isVisible ? Number(balance.sats_value).toLocaleString() : hiddenBalance}
            </p>
            <p>sats</p>
        </div>
        <div className="space-y-1">
            <p className="font-semibold text-base text-foreground">
              {isVisible ? `${Number(balance.bif_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : hiddenBalance}
            </p>
             <p>BIF</p>
        </div>
      </div>
    </div>
  );
}
