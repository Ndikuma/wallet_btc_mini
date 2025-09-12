
"use client";

import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Transaction, PaginatedResponse } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const btcPrice = 65000; // Mock price

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const response = await api.get<PaginatedResponse<Transaction>>(`/transaction/`);
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
                    <TableHead>Name</TableHead>
                    <TableHead>Transaction Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                    </TableRow>
                ))
              ) : transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                    <TableRow key={tx.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                            {tx.type === "sent" ? (
                            <ArrowUpRight className="size-5 text-destructive" />
                            ) : (
                            <ArrowDownLeft className="size-5 text-green-600" />
                            )}
                        </div>
                        <div className="font-medium">Bitcoin</div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium capitalize">{tx.status}</span>
                            <span className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleString()}</span>
                        </div>
                    </TableCell>
                    <TableCell
                        className={cn(
                        "text-right font-mono text-base",
                        tx.type === "sent" ? "text-destructive" : "text-green-600"
                        )}
                    >
                        {tx.type === "sent" ? "-" : "+"}${(tx.amount * btcPrice).toFixed(2)}
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
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
