
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Balance } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { AxiosError } from "axios";
import { cn } from "@/lib/utils";

interface BalanceDisplayProps {
  isLarge?: boolean;
}

export function BalanceDisplay({ isLarge = false }: BalanceDisplayProps) {
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
      <div className={cn("flex flex-col", isLarge ? "gap-2 items-start" : "gap-1 items-end")}>
        <Skeleton className={cn("w-32", isLarge ? "h-10" : "h-6")} />
        <Skeleton className={cn("w-40", isLarge ? "h-5" : "h-4")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-destructive">
        <AlertCircle className="size-4" />
        <span>{error}</span>
      </div>
    );
  }
  
  if (!balance) return null;

  return (
    <div className={cn("flex flex-col font-mono", isLarge ? "items-start gap-1" : "items-end")}>
      <p className={cn("font-bold", isLarge ? "text-3xl sm:text-4xl" : "text-base")}>
        {(balance.usd_value || 0).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </p>
      <div className={cn("flex flex-wrap items-center text-muted-foreground", isLarge ? "gap-x-4 gap-y-1 text-sm" : "gap-x-2 text-xs justify-end")}>
        <span>{(balance.btc_value || 0).toFixed(8)} BTC</span>
        <span className="hidden sm:inline">≈ {(balance.sats_value || 0).toLocaleString()} Sats</span>
        <span className="hidden md:inline">≈ {(balance.bif_value || 0).toLocaleString('fr-BI', { style: 'currency', currency: 'BIF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
}
