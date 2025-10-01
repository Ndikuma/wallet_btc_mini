
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Balance } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useSettings } from "@/context/settings-context";

interface BalanceDisplayProps {
  isVisible: boolean;
}

export function BalanceDisplay({ isVisible }: BalanceDisplayProps) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    async function fetchBalance() {
      setLoading(true);
      setError(null);
      try {
        const balanceRes = await api.getWalletBalance();
        setBalance(balanceRes.data);
      } catch (err: any) {
        console.error("Failed to fetch balance data", err);
        setError(err.message || "Could not load balance.");
      } finally {
        setLoading(false);
      }
    }
    fetchBalance();
  }, []);
  
  const getPrimaryBalance = () => {
    if (!balance) return "";
    switch (settings.displayUnit) {
      case "sats": return balance.sats_value;
      case "usd": return balance.usd_value;
      case "bif": return balance.bif_value;
      case "btc":
      default:
        return balance.btc_value;
    }
  }
  
  const getSecondaryBalances = () => {
    if (!balance) return { val1: "", val2: "" };
    switch (settings.displayUnit) {
      case "sats": return { val1: balance.btc_value, val2: balance.usd_value };
      case "usd": return { val1: balance.btc_value, val2: balance.sats_value };
      case "bif": return { val1: balance.btc_value, val2: balance.usd_value };
      case "btc":
      default:
        return { val1: balance.sats_value, val2: balance.usd_value };
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="flex items-center gap-6 pt-2">
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
  const primaryBalance = getPrimaryBalance();
  const { val1, val2 } = getSecondaryBalances();

  return (
    <div className="w-full space-y-4">
      <p className="text-3xl sm:text-4xl font-bold tracking-tight">
        {isVisible ? primaryBalance : hiddenBalance}
      </p>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <p className="font-medium">{isVisible ? val1 : hiddenBalance}</p>
        <p className="font-medium">{isVisible ? val2 : hiddenBalance}</p>
         {settings.displayUnit !== 'bif' && (
          <p className="font-medium">
            {isVisible ? balance.bif_value : hiddenBalance}
          </p>
        )}
      </div>
    </div>
  );
}
