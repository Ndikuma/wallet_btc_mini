
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, DollarSign, LineChart, BarChart, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface BitcoinStats {
  usd: number;
  usd_market_cap: number;
  usd_24h_vol: number;
  usd_24h_change: number;
}

interface CachedData {
  timestamp: number;
  data: BitcoinStats;
}

const StatCard = ({
  title,
  value,
  change,
  icon,
  isLoading,
  format,
}: {
  title: string;
  value?: number;
  change?: number;
  icon: React.ReactNode;
  isLoading: boolean;
  format: "currency" | "number" | "percent";
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return val.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      case "percent":
        return `${val.toFixed(2)}%`;
      case "number":
        return val.toLocaleString("en-US", {
          maximumFractionDigits: 0,
        });
      default:
        return String(val);
    }
  };
  
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="mt-1 h-4 w-1/2" />
          </>
        ) : value !== undefined ? (
          <>
            <div className="text-2xl font-bold">{formatValue(value)}</div>
            {change !== undefined && (
              <p className={cn("text-xs text-muted-foreground flex items-center", isPositive ? "text-green-600" : "text-destructive")}>
                 {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                {change.toFixed(2)}% in 24h
              </p>
            )}
          </>
        ) : (
            <div className="text-sm text-muted-foreground">Not available</div>
        )}
      </CardContent>
    </Card>
  );
};


export function PriceStats() {
  const [stats, setStats] = useState<BitcoinStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const cacheKey = "bitcoinPriceStats";
      const fifteenMinutes = 15 * 60 * 1000;

      try {
        // Check cache first
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
          const { timestamp, data }: CachedData = JSON.parse(cachedItem);
          if (Date.now() - timestamp < fifteenMinutes) {
            setStats(data);
            setLoading(false);
            return;
          }
        }

        // Fetch new data if cache is old or doesn't exist
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
        );
        if (!response.ok) {
           throw new Error("Failed to fetch price data");
        }
        
        const result = await response.json();
        const newStats = result.bitcoin;
        setStats(newStats);
        
        // Update cache
        const newCachedData: CachedData = {
          timestamp: Date.now(),
          data: newStats,
        };
        localStorage.setItem(cacheKey, JSON.stringify(newCachedData));

      } catch (error) {
        console.error("Could not fetch Bitcoin price stats:", error);
        // Do not show error to user as requested
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Bitcoin Price"
        value={stats?.usd}
        change={stats?.usd_24h_change}
        icon={<DollarSign className="h-4 w-4" />}
        isLoading={loading}
        format="currency"
      />
      <StatCard
        title="Market Cap"
        value={stats?.usd_market_cap}
        icon={<Scale className="h-4 w-4" />}
        isLoading={loading}
        format="currency"
      />
       <StatCard
        title="24h Volume"
        value={stats?.usd_24h_vol}
        icon={<BarChart className="h-4 w-4" />}
        isLoading={loading}
        format="currency"
      />
       <StatCard
        title="24h Change"
        value={stats?.usd_24h_change}
        icon={<LineChart className="h-4 w-4" />}
        isLoading={loading}
        format="percent"
      />
    </div>
  );
}

    