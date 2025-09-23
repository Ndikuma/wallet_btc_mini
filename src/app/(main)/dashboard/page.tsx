
"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn, shortenText } from "@/lib/utils";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Transaction } from "@/lib/types";
import { AxiosError } from "axios";
import { BalanceDisplay } from "@/components/balance-display";

export default function DashboardPage() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);


  useEffect(() => {
    async function checkWalletStatus() {
      try {
        // A simple API call to check if the wallet is ready
        await api.getWalletBalance();
      } catch (err: any) {
         if (err instanceof AxiosError && err.response?.status === 403) {
            setError("Your wallet is being set up. This can take a moment. Please try refreshing in a few seconds.");
        }
      }
    }
    checkWalletStatus();
  }, []);

  useEffect(() => {
    async function fetchTransactions() {
      setLoadingTransactions(true);
      setTransactionsError(null);
      try {
        const transactionsRes = await api.getTransactions();
        setRecentTransactions(transactionsRes.data || []);
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
    <div className="flex flex-col gap-4 md:gap-8">
       <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Current Balance</CardTitle>
            <CardDescription>Your wallet summary</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsBalanceVisible(!isBalanceVisible)}>
              {isBalanceVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              <span className="sr-only">Toggle Balance Visibility</span>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
            <BalanceDisplay isVisible={isBalanceVisible} />
        </CardContent>
      </Card>


       <div className="grid grid-cols-1 gap-4 md:gap-6">
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
              <div className="space-y-8">
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
                        <div className="flex-1 grid gap-1">
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
                             Fee: {tx.fee_formatted.replace("BTC", "")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : null}
                {!loadingTransactions && !transactionsError && (!recentTransactions || recentTransactions.length === 0) && (
                  <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                    No transactions yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
       </div>
    </div>
  );
}
