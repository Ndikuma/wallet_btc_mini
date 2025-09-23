
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Balance } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

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

  const containerClasses = cn("flex flex-col gap-2");

  const skeletonPrimaryClasses = cn("w-48", isLarge ? "h-10" : "h-8");
  const skeletonSecondaryClasses = "h-5 w-24";

  if (loading) {
    return (
      <div className={containerClasses}>
        <Skeleton className={skeletonPrimaryClasses} />
        <Separator className="my-2" />
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <Skeleton className={skeletonSecondaryClasses} />
                <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-1">
                <Skeleton className={skeletonSecondaryClasses} />
                <Skeleton className="h-4 w-12" />
            </div>
             <div className="space-y-1">
                <Skeleton className={skeletonSecondaryClasses} />
                <Skeleton className="h-4 w-12" />
            </div>
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

  return (
    <div className="font-mono w-full">
      <p className={cn("font-bold tracking-tight", isLarge ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl")}>
        {(balance.usd_value || 0).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </p>
      <Separator className="my-4" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
         <div className="space-y-1">
            <p className="font-medium">{(balance.btc_value || 0).toFixed(8)}</p>
            <p className="text-xs text-muted-foreground">BTC</p>
        </div>
        <div className="space-y-1">
            <p className="font-medium">{(balance.sats_value || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Sats</p>
        </div>
         <div className="space-y-1">
            <p className="font-medium">{(balance.bif_value || 0).toLocaleString('fr-BI', { style: 'currency', currency: 'BIF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground">BIF</p>
        </div>
      </div>
    </div>
  );
}
