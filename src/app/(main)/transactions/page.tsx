
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Copy,
  ExternalLink,
  Hash,
  Landmark,
  CalendarClock,
  CircleCheck,
  CircleX,
  Clock,
  Loader2,
} from "lucide-react";
import { cn, shortenText } from "@/lib/utils";
import api from "@/lib/api";
import type { Transaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type VariantProps } from "class-variance-authority";
import { AxiosError } from "axios";

const DetailRow = ({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: string | null, children?: React.ReactNode }) => {
  const { toast } = useToast();
  const onCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      toast({ title: `${label} vyakoporowe` });
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {children ? (
          <div className="text-sm font-semibold">{children}</div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="font-code text-sm font-semibold break-all">{value ? shortenText(value, 6, 6) : 'N/A'}</p>
            {value && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCopy}><Copy className="size-3.5" /></Button>}
          </div>
        )}
      </div>
    </div>
  )
}

const TransactionCard = ({ tx }: { tx: Transaction }) => {
  const isSent = tx.transaction_type === "internal" || tx.transaction_type === "send";
  const relevantAddress = isSent ? tx.to_address : tx.from_address;

  const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return CircleCheck;
      case 'pending': return Clock;
      case 'failed': return CircleX;
      default: return AlertCircle;
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <Accordion type="single" collapsible>
          <AccordionItem value={tx.txid} className="border-b-0">
            <AccordionTrigger className="p-4 hover:no-underline">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  {isSent ? (
                    <ArrowUpRight className="size-5 text-destructive" />
                  ) : (
                    <ArrowDownLeft className="size-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 grid gap-1 text-left">
                  <p className="font-medium truncate">
                    {isSent ? "Yarungitswe" : "Yakiriwe"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("font-semibold font-mono", isSent ? "text-destructive" : "text-green-600")}>
                    {tx.amount_formatted}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Agash.: {tx.fee_formatted.replace("BTC", "")}
                  </p>
                </div>
                <div className="pl-2">
                    <ChevronDown className="chevron size-5 text-muted-foreground transition-transform" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="border-t pt-4 px-4 pb-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <DetailRow icon={getStatusIcon(tx.status)} label="Uko bigenze">
                     <Badge variant={getStatusVariant(tx.status)} className="capitalize text-sm">{tx.status}</Badge>
                  </DetailRow>
                  <DetailRow icon={CalendarClock} label="Itariki & Igihe">
                     <p className="text-sm font-semibold">{new Date(tx.created_at).toLocaleString()}</p>
                  </DetailRow>
                  <DetailRow icon={Hash} label="Indangamuntu y'igikorwa" value={tx.txid} />
                  <DetailRow icon={Landmark} label="Agashirukiramico" value={tx.fee_formatted.replace("BTC", "")} />
                  <DetailRow icon={ArrowUpRight} label="Aderese y'uwarungitse" value={tx.from_address} />
                  <DetailRow icon={ArrowDownLeft} label="Aderese y'uwakiriye" value={tx.to_address} />
                </div>
                {tx.explorer_url && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={tx.explorer_url} target="_blank" rel="noopener noreferrer">
                      Raba kuri Block Explorer <ExternalLink className="ml-2 size-4" />
                    </Link>
                  </Button>
                )}
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

  const fetchTransactions = useCallback(async () => {
    setTransactionsError(null);
    setLoadingTransactions(true);
    try {
      const transactionsRes = await api.getTransactions();
      setTransactions(transactionsRes.data.results || transactionsRes.data || []);
    } catch (err: any) {
      console.error("Gupakira ibikorwa biranse", err);
      let errorMsg = "Ntivyakunze gupakira kahise k'ibikorwa.";
      if (err instanceof AxiosError && err.code === 'ERR_NETWORK') {
          errorMsg = "Ikosa rya rezo. Ntivyakunze kwihuza na seriveri.";
      } else if (err.message) {
          errorMsg = err.message;
      }
      setTransactionsError(errorMsg);
      toast({
        variant: "destructive",
        title: "Ikosa",
        description: errorMsg,
      });
    } finally {
      setLoadingTransactions(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Kahise k'Ibikorwa</h1>
        <p className="text-muted-foreground">
          Raba ibikorwa vyose vyo mu irembo ryawe.
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
                    <p className="mt-2 font-semibold">Ikosa mu gupakira ibikorwa</p>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">{transactionsError}</p>
                    <Button onClick={fetchTransactions} variant="secondary" className="mt-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" hidden={!loadingTransactions}/>
                        Subira Ugerageze
                    </Button>
                </div>
            </Card>
        ) : transactions.length > 0 ? (
          transactions.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
          ))
        ) : (
          <Card className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Nta bikorwa biraboneka.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
