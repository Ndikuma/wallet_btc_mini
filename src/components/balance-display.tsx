
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
  isVisible: boolean;
}

export function BalanceDisplay({ isLarge = false, isVisible }: BalanceDisplayProps) {
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

  const containerClasses = cn("flex flex-col gap-2");

  const skeletonPrimaryClasses = cn("w-48", isLarge ? "h-10" : "h-8");
  const skeletonSecondaryClasses = "h-5 w-24";

  if (loading) {
    return (
      <div className={containerClasses}>
        <Skeleton className={skeletonPrimaryClasses} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
            <Skeleton className={skeletonSecondaryClasses} />
            <Skeleton className={skeletonSecondaryClasses} />
            <Skeleton className={skeletonSecondaryClasses} />
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
    <div className="font-mono w-full space-y-2">
      <p className={cn("font-bold tracking-tight", isLarge ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl")}>
         {isVisible ? `$${balance.usd_value}` : hiddenBalance}
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 text-sm">
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
