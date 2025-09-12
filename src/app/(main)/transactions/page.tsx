
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Transaction, PaginatedResponse } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const btcPrice = 65000; // Mock price

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const response = await api.getTransactions();
        setTransactions(response.data.results || []);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

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
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-10 w-10 ml-auto" /></TableCell>
                    </TableRow>
                ))
              ) : transactions && transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isSent = tx.transaction_type === "internal" || tx.transaction_type === "send";
                  const amountNum = parseFloat(tx.amount);
                  return (
                    <TableRow key={tx.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                    {isSent ? (
                                        <ArrowUpRight className="size-5 text-destructive" />
                                    ) : (
                                        <ArrowDownLeft className="size-5 text-green-600" />
                                    )}
                                </div>
                                <div className="font-medium capitalize">{isSent ? "Sent" : "Received"}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium capitalize">{tx.status}</span>
                                <span className="text-sm text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                           <div className={cn(
                              "font-mono text-base",
                              isSent ? "text-destructive" : "text-green-600"
                            )}>
                                {isSent ? "-" : "+"}${Math.abs(amountNum * btcPrice).toFixed(2)}
                            </div>
                             <div className="text-xs text-muted-foreground font-mono">
                                {isSent ? "-" : "+"}
                                {Math.abs(amountNum).toFixed(8)} BTC
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                           {tx.explorer_url && (
                                <Button asChild variant="ghost" size="icon" title="View on Block Explorer">
                                    <Link href={tx.explorer_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="size-4" />
                                    </Link>
                                </Button>
                           )}
                        </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
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
