
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
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn, shortenText } from "@/lib/utils";
import api from "@/lib/api";
import type { Transaction, PaginatedResponse, Balance } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge, badgeVariants } from "@/components/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type VariantProps } from "class-variance-authority";
import { AxiosError } from "axios";

const TransactionCard = ({ tx }: { tx: Transaction }) => {
  const { toast } = useToast();
  const isSent = tx.transaction_type === "internal" || tx.transaction_type === "send";
  
  const relevantAddress = isSent ? tx.to_address : tx.from_address;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied`,
    });
  };
  
  const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <Accordion type="single" collapsible>
          <AccordionItem value={tx.txid} className="border-b-0">
             <div className="flex items-start p-4">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                    {isSent ? (
                        <ArrowUpRight className="size-5 text-destructive" />
                    ) : (
                        <ArrowDownLeft className="size-5 text-green-600" />
                    )}
                </div>
                <div className="ml-4 flex-1">
                   <p className="font-medium truncate">
                      {isSent ? "Sent to" : "Received from"}{' '}
                      <span className="font-mono text-muted-foreground">{shortenText(relevantAddress, 4, 4)}</span>
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

            <AccordionContent className="pt-0 px-4 pb-4 space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <Badge variant={getStatusVariant(tx.status)} className="capitalize">{tx.status}</Badge>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-muted-foreground">TXID:</span>
                    <div className="flex items-center gap-2 font-code">
                        <span>{shortenText(tx.txid)}</span>
                        {tx.txid && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(tx.txid, 'TXID')}><Copy className="size-3.5" /></Button>}
                    </div>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-muted-foreground">Fee:</span>
                    <span className="font-mono">{tx.fee_formatted.replace("BTC", "")}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-muted-foreground">From:</span>
                    <div className="flex items-center gap-2 font-code">
                        <span>{shortenText(tx.from_address)}</span>
                        {tx.from_address && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(tx.from_address!, 'Address')}><Copy className="size-3.5" /></Button>}
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-muted-foreground">To:</span>
                     <div className="flex items-center gap-2 font-code">
                        <span>{shortenText(tx.to_address)}</span>
                        {tx.to_address && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(tx.to_address!, 'Address')}><Copy className="size-3.5" /></Button>}
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Date:</span>
                    <span className="text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    {tx.explorer_url && (
                        <Button asChild variant="link" size="sm" className="p-0 h-auto">
                            <Link href={tx.explorer_url} target="_blank" rel="noopener noreferrer">
                                View on Block Explorer <ExternalLink className="ml-2 size-3.5" />
                            </Link>
                        </Button>
                    )}
                     <AccordionTrigger className="p-1 hover:no-underline [&[data-state=open]>svg]:text-primary w-auto">
                        <span className="text-sm mr-1">Details</span>
                        <ChevronDown className="size-4" />
                    </AccordionTrigger>
                </div>
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
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      setLoadingTransactions(true);
      setTransactionsError(null);
      try {
        const transactionsRes = await api.getTransactions();
        setTransactions(transactionsRes.data.results || []);
      } catch (err: any) {
        console.error("Failed to fetch transactions", err);
        if (err instanceof AxiosError && err.code === 'ERR_NETWORK') {
            setTransactionsError("Network error. Could not connect to the server.");
         } else {
            setTransactionsError("Could not load transaction history.");
         }
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch transaction history."
        })
      } finally {
        setLoadingTransactions(false);
      }
    }
    fetchTransactions();
  }, [toast]);


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Transaction History</h1>
        <p className="text-muted-foreground">
          View all your wallet transactions.
        </p>
      </div>
      <div className="space-y-4">
        {loadingTransactions ? (
          Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))
        ) : transactionsError ? (
            <Card className="flex h-48 items-center justify-center">
                <div className="text-center text-destructive">
                    <AlertCircle className="mx-auto h-8 w-8" />
                    <p className="mt-2 font-semibold">{transactionsError}</p>
                    <p className="text-sm text-muted-foreground">Please try again later.</p>
                </div>
            </Card>
        ) : transactions && transactions.length > 0 ? (
          transactions.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
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

    