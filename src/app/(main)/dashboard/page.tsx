
"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Repeat,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Wallet, Transaction, Balance } from "@/lib/types";
import { AxiosError } from "axios";
import PriceStats from "./price-stats";

export default function DashboardPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [recentTransactions, setRecentTransactions]  = useState<Transaction[]>([]);
  
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const shortenText = (text: string | null | undefined, start = 8, end = 8) => {
    if (!text) return 'an external address';
    if (text.length <= start + end) return text;
    return `${text.substring(0, start)}...${text.substring(text.length - end)}`;
  }


  useEffect(() => {
    async function fetchBalance() {
      setLoadingBalance(true);
      try {
        const balanceRes = await api.getWalletBalance();
        setBalance(balanceRes.data);
      } catch (err: any) {
         if (err instanceof AxiosError && err.response?.status === 403) {
            setError("Your wallet is being set up. This can take a moment. Please try refreshing in a few seconds.");
        } else {
            console.error("Failed to fetch balance data", err);
            setError("Could not load balance data. Please try again later.");
        }
      } finally {
        setLoadingBalance(false);
      }
    }
    fetchBalance();
  }, []);

  useEffect(() => {
    async function fetchWallet() {
      setLoadingWallet(true);
      setWalletError(null);
      try {
        const walletRes = await api.getWallets();
        if (Array.isArray(walletRes.data) && walletRes.data.length > 0) {
          setWallet(walletRes.data[0]);
        } else {
           setWallet(walletRes.data as Wallet);
        }
      } catch (err: any) {
        console.error("Failed to fetch wallet stats", err);
        if (err instanceof AxiosError && err.code === 'ERR_NETWORK') {
            setWalletError("Network error loading stats.");
        } else {
            setWalletError("Could not load wallet stats.");
        }
      } finally {
        setLoadingWallet(false);
      }
    }
    fetchWallet();
  }, []);

  useEffect(() => {
    async function fetchTransactions() {
      setLoadingTransactions(true);
      setTransactionsError(null);
      try {
        const transactionsRes = await api.getTransactions();
        setRecentTransactions((transactionsRes.data as Transaction[]) || []);
      } catch (err: any) {
         console.error("Failed to fetch recent transactions", err);
         if (err instanceof AxiosError && err.code === 'ERR_NETWORK') {
            setTransactionsError("Network error. Could not connect to the server.");
         } else {
            setTransactionsError("Could not load recent transactions.");
         }
      } finally {
        setLoadingTransactions(false);
      }
    }
    fetchTransactions();
  }, []);

  
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
             {loadingBalance ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-full max-w-xs" />
                </div>
             ) : (
                <>
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
                </>
             )}
          </CardHeader>
           <CardContent className="pt-4">
             <PriceStats />
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

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loadingWallet && (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                  <CardHeader>
                      <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent>
                      <Skeleton className="h-8 w-32" />
                  </CardContent>
              </Card>
            ))
          )}
          {walletError && !loadingWallet && (
             <div className="lg:col-span-4 text-center text-destructive">
                <AlertCircle className="mr-2 size-4 inline-block" /> {walletError}
            </div>
          )}
          {!loadingWallet && !walletError && wallet?.stats ? (
            <>
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
            </>
          ) : null}
      </div>

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
            {loadingTransactions && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
            {transactionsError && (
                 <div className="h-24 text-center flex items-center justify-center text-destructive">
                    <AlertCircle className="mr-2 size-4" /> {transactionsError}
                </div>
            )}
            {!loadingTransactions && !transactionsError && recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 4).map((tx) => {
                const isSent = tx.transaction_type === "internal" || tx.transaction_type === "send";
                const amountNum = parseFloat(tx.amount);
                const btcToUsdRate = (balance?.usd_value || 0) / (balance?.btc_value || 1);
                const usdValue = Math.abs(amountNum * btcToUsdRate);
                const relevantAddress = isSent ? tx.to_address : tx.from_address;


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
                       <p className="font-medium truncate">
                        {isSent ? "Sent to" : "Received from"}{' '}
                        <span className="font-mono text-muted-foreground">{shortenText(relevantAddress)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className={cn("font-semibold font-mono", isSent ? "text-destructive" : "text-green-600")}>
                        {tx.amount_formatted}
                      </p>
                       <p className="text-xs text-muted-foreground font-mono">
                         {isSent ? "-" : "+"} ${usdValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : null}
            {!loadingTransactions && !transactionsError && (!recentTransactions || recentTransactions.length === 0) && (
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

    
