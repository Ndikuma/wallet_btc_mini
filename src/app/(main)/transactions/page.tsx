
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Transaction, PaginatedResponse, Balance } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function TransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const [transactionsRes, balanceRes] = await Promise.all([
          api.getTransactions(),
          api.getWalletBalance(),
        ]);
        setTransactions((transactionsRes.data as PaginatedResponse<Transaction>).results || []);
        setBalance(balanceRes.data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
        setTransactions([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch transaction history."
        })
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [toast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
    });
  };

  const btcToUsdRate = (balance?.usd_value || 0) / (balance?.btc_value || 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          View all your wallet transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                    </TableRow>
                ))
              ) : transactions && transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isSent = tx.transaction_type === "internal" || tx.transaction_type === "send";
                  const amountNum = parseFloat(tx.amount);
                  const usdValue = Math.abs(amountNum * btcToUsdRate);
                  const relevantAddress = isSent ? tx.to_address : tx.from_address;

                  return (
                    <TableRow key={tx.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full",
                                    isSent ? "bg-destructive/10" : "bg-green-500/10"
                                    )}>
                                    {isSent ? (
                                        <ArrowUpRight className="size-4 text-destructive" />
                                    ) : (
                                        <ArrowDownLeft className="size-4 text-green-600" />
                                    )}
                                </div>
                                <div className="font-medium capitalize">{isSent ? "Sent" : "Received"}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                           <div className="text-sm">{new Date(tx.created_at).toLocaleDateString()}</div>
                           <div className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleTimeString()}</div>
                        </TableCell>
                         <TableCell>
                           {relevantAddress && (
                             <div className="flex items-center gap-2 font-code text-sm">
                               <span className="truncate max-w-[120px] sm:max-w-[200px]">{relevantAddress}</span>
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(relevantAddress)}>
                                 <Copy className="size-3.5" />
                               </Button>
                               {tx.explorer_url && (
                                <Button asChild variant="ghost" size="icon" className="h-7 w-7" title="View on Block Explorer">
                                    <Link href={tx.explorer_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="size-3.5" />
                                    </Link>
                                </Button>
                               )}
                             </div>
                           )}
                        </TableCell>
                        <TableCell>
                            <Badge variant={tx.is_confirmed ? "success" : "secondary"} className="capitalize">
                                {tx.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <div className={cn(
                              "font-mono font-medium",
                              isSent ? "text-destructive" : "text-green-600"
                            )}>
                                {isSent ? "-" : "+"}${usdValue.toFixed(2)}
                            </div>
                             <div className="text-xs text-muted-foreground font-mono">
                                {tx.amount_formatted}
                            </div>
                        </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

    