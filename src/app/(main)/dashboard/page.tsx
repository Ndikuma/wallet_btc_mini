
"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Repeat,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BitcoinIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import type { Wallet, Transaction, Balance, PaginatedResponse } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AxiosError } from "axios";


export default function DashboardPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [recentTransactions, setRecentTransactions]  = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [walletRes, balanceRes, transactionsRes] = await Promise.all([
          api.getWallets(),
          api.getWalletBalance(),
          api.getTransactions(),
        ]);
        
        if (Array.isArray(walletRes.data) && walletRes.data.length > 0) {
          setWallet(walletRes.data[0]);
        } else {
           setWallet(walletRes.data as Wallet);
        }
        
        setBalance(balanceRes.data);

        setRecentTransactions((transactionsRes.data as Transaction[]) || []);
      } catch (err: any) {
        if (err instanceof AxiosError && err.response?.status === 403) {
            setError("Your wallet is being set up. This can take a moment. Please try refreshing in a few seconds.");
        } else {
            console.error("Failed to fetch dashboard data", err);
            setError("Could not load dashboard data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();

  }, []);

  if (loading) {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-10 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[120px] w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-5 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
             </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }
  
    if (error) {
        const handleRefresh = () => {
             window.location.reload();
        };

        return (
            <div className="flex items-center justify-center h-full">
                <Alert variant="destructive" className="max-w-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Wallet Not Ready</AlertTitle>
                    <AlertDescription>
                        {error}
                        <div className="mt-4">
                            <Button onClick={handleRefresh}>Refresh</Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }


  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
             <CardTitle className="text-muted-foreground">Current Balance</CardTitle>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{(balance?.usd_value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
             </div>
             <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{(balance?.btc_value || 0).toFixed(8)} BTC</span>
                <Separator orientation="vertical" className="h-4 hidden sm:block" />
                <span>≈ {(balance?.sats_value || 0).toLocaleString()} Sats</span>
                 <Separator orientation="vertical" className="h-4 hidden sm:block" />
                <span>≈ {(balance?.bif_value || 0).toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}</span>
             </div>
          </CardHeader>
          <CardContent className="h-[120px] w-full pt-4 flex items-center justify-center text-muted-foreground">
              Price chart data is not available at the moment.
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow grid grid-cols-2 gap-4">
            <Button size="lg" asChild className="h-auto py-4">
              <Link href="/send" className="flex flex-col items-center gap-2">
                <ArrowUpRight className="size-6" /> 
                <span>Send</span>
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="h-auto py-4">
              <Link href="/receive" className="flex flex-col items-center gap-2">
                <ArrowDownLeft className="size-6" /> 
                <span>Receive</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

       {wallet?.stats && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <Repeat className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{wallet.stats.total_transactions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{wallet.stats.total_sent.toFixed(8)} BTC</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{wallet.stats.total_received.toFixed(8)} BTC</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wallet Age</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{wallet.stats.wallet_age_days} days</div>
                    </CardContent>
                </Card>
            </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Recent Transactions</CardTitle>
            </div>
            <Button variant="link" size="sm" asChild className="text-primary">
              <Link href="/transactions">
                See All
              </Link>
            </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
            {!loading && recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 4).map((tx) => {
                const isSent = tx.transaction_type === "internal" || tx.transaction_type === "send";
                const amountNum = parseFloat(tx.amount);
                const usdValue = Math.abs(amountNum * (balance?.usd_value || 0) / (balance?.btc_value || 1));

                return (
                  <div key={tx.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                      {isSent ? (
                        <ArrowUpRight className="size-5 text-destructive" />
                      ) : (
                        <ArrowDownLeft className="size-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{isSent ? "Sent" : "Received"} Bitcoin</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-semibold font-mono", isSent ? "text-destructive" : "text-green-600")}>
                        {isSent ? "-" : "+"} ${usdValue.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {tx.amount_formatted}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : null}
            {!loading && (!recentTransactions || recentTransactions.length === 0) && (
              <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                No recent transactions.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
