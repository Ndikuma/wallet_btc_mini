
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowDown, ArrowUp, BarChart, DollarSign, Globe, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CryptoPriceStats {
  bitcoin: {
    usd: number;
    usd_market_cap: number;
    usd_24h_vol: number;
    usd_24h_change: number;
  };
}

interface PriceStatsProps {
  stats: CryptoPriceStats | null;
  loading: boolean;
  error: string | null;
}

const formatCurrency = (value: number, decimals = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const formatLargeNumber = (value: number) => {
    if (value >= 1_000_000_000_000) {
        return `${formatCurrency(value / 1_000_000_000_000, 2)}T`;
    }
    if (value >= 1_000_000_000) {
        return `${formatCurrency(value / 1_000_000_000, 2)}B`;
    }
    if (value >= 1_000_000) {
        return `${formatCurrency(value / 1_000_000, 2)}M`;
    }
    return formatCurrency(value);
};

export default function PriceStats({ stats, loading, error }: PriceStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
           <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-24 mt-2" />
                </CardContent>
            </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="md:col-span-4">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center text-destructive">
                        <AlertCircle className="mr-2 size-4" /> {error}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!stats) return null;

  const { usd, usd_24h_change, usd_market_cap, usd_24h_vol } = stats.bitcoin;
  const isPositiveChange = usd_24h_change >= 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bitcoin Price</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(usd)}</div>
           <p className="text-xs text-muted-foreground">
            Current price in USD
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">24h Change</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", isPositiveChange ? "text-green-600" : "text-destructive")}>
            {isPositiveChange ? "+" : ""}
            {usd_24h_change.toFixed(2)}%
          </div>
          <div className={cn("flex items-center text-xs", isPositiveChange ? "text-green-600" : "text-destructive")}>
            {isPositiveChange ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            <span className="text-muted-foreground">from 24 hours ago</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatLargeNumber(usd_market_cap)}</div>
           <p className="text-xs text-muted-foreground">
            Total market value
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatLargeNumber(usd_24h_vol)}</div>
           <p className="text-xs text-muted-foreground">
            Total trading volume
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
