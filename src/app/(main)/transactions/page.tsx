
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
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Transaction, PaginatedResponse, Balance } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const TransactionCard = ({ tx, btcToUsdRate }: { tx: Transaction; btcToUsdRate: number }) => {
  const { toast } = useToast();
  const isSent = tx.transaction_type === "internal" || tx.transaction_type === "send";
  const amountNum = parseFloat(tx.amount);
  const usdValue = Math.abs(amountNum * btcToUsdRate);
  
  const relevantAddress = isSent ? tx.to_address : tx.from_address;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied`,
    });
  };
  
  const shortenText = (text: string | null | undefined, start = 6, end = 6) => {
    if (!text) return 'N/A';
    if (text.length <= start + end) return text;
    return `${text.substring(0, start)}...${text.substring(text.length - end)}`;
  }

  const getStatusVariant = (status: string): "success" | "warning" | "destructive" => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  }

  return (
    <Card className={cn(
      "shadow-sm transition-all",
      isSent ? 'bg-destructive/5' : 'bg-green-500/5'
    )}>
      <CardContent className="p-4">
        <Accordion type="single" collapsible>
          <AccordionItem value={tx.txid} className="border-b-0">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isSent ? "bg-destructive/10" : "bg-green-600/10"
                    )}>
                    {isSent ? (
                        <ArrowUpRight className="size-5 text-destructive" />
                    ) : (
                        <ArrowDownLeft className="size-5 text-green-600" />
                    )}
                </div>
                <div className="flex-1 grid gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-muted-foreground">{shortenText(tx.txid)}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(tx.txid, 'TXID')}>
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                  <p className={cn(
                      "font-semibold text-lg font-mono",
                      isSent ? "text-destructive" : "text-green-600"
                    )}>
                      {tx.amount_formatted}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Fee: {tx.fee_formatted}</span>
                    <span>Service Fee: {tx.service_fee_formatted}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-sm sm:w-48 shrink-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(tx.status)} className="capitalize">{tx.status}</Badge>
                    <AccordionTrigger className="p-1 hover:no-underline [&[data-state=open]>svg]:text-primary">
                        <ChevronDown className="size-4" />
                    </AccordionTrigger>
                  </div>
                 <div className="text-xs text-muted-foreground text-right">
                    {tx.confirmations} Confirmations
                </div>
                <div className="text-xs text-muted-foreground text-right">
                    {new Date(tx.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <AccordionContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">From:</span>
                    <div className="flex items-center gap-2 font-code">
                        <span>{shortenText(tx.from_address)}</span>
                        {tx.from_address && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(tx.from_address!, 'Address')}><Copy className="size-3.5" /></Button>}
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">To:</span>
                     <div className="flex items-center gap-2 font-code">
                        <span>{shortenText(tx.to_address)}</span>
                        {tx.to_address && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(tx.to_address!, 'Address')}><Copy className="size-3.5" /></Button>}
                    </div>
                </div>
                {tx.explorer_url && (
                    <Button asChild variant="link" size="sm" className="p-0 h-auto">
                        <Link href={tx.explorer_url} target="_blank" rel="noopener noreferrer">
                            View on Block Explorer <ExternalLink className="ml-2 size-3.5" />
                        </Link>
                    </Button>
                )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}


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


  const btcToUsdRate = (balance?.usd_value || 0) / (balance?.btc_value || 1);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Transaction History</h1>
        <p className="text-muted-foreground">
          View all your wallet transactions.
        </p>
      </div>
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))
        ) : transactions && transactions.length > 0 ? (
          transactions.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} btcToUsdRate={btcToUsdRate} />
          ))
        ) : (
          <Card className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">No transactions found.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

    