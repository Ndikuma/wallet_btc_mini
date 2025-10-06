
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
  Zap,
} from "lucide-react";
import { cn, shortenText } from "@/lib/utils";
import api from "@/lib/api";
import type { Transaction, LightningTransaction } from "@/lib/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// --- On-Chain Components ---

const DetailRow = ({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: string | null, children?: React.ReactNode }) => {
  const { toast } = useToast();
  const onCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      toast({ title: `${label} copié` });
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
                    {isSent ? "Envoyé" : "Reçu"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("font-semibold font-mono", isSent ? "text-destructive" : "text-green-600")}>
                    {tx.amount_formatted}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Frais: {tx.fee_formatted.replace("BTC", "")}
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
                  <DetailRow icon={getStatusIcon(tx.status)} label="Statut">
                     <Badge variant={getStatusVariant(tx.status)} className="capitalize text-sm">{tx.status}</Badge>
                  </DetailRow>
                  <DetailRow icon={CalendarClock} label="Date & Heure">
                     <p className="text-sm font-semibold">{new Date(tx.created_at).toLocaleString('fr-FR')}</p>
                  </DetailRow>
                  <DetailRow icon={Hash} label="ID de Transaction" value={tx.txid} />
                  <DetailRow icon={Landmark} label="Frais de réseau" value={tx.fee_formatted.replace("BTC", "")} />
                  <DetailRow icon={ArrowUpRight} label="Adresse de l'expéditeur" value={tx.from_address} />
                  <DetailRow icon={ArrowDownLeft} label="Adresse du destinataire" value={tx.to_address} />
                </div>
                {tx.explorer_url && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={tx.explorer_url} target="_blank" rel="noopener noreferrer">
                      Voir sur l'explorateur de blocs <ExternalLink className="ml-2 size-4" />
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

const OnChainTransactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const transactionsRes = await api.getTransactions();
      setTransactions(transactionsRes.data.results || transactionsRes.data || []);
    } catch (err: any) {
      let errorMsg = "Impossible de charger l'historique des transactions.";
      if (err instanceof AxiosError && err.code === 'ERR_NETWORK') {
          errorMsg = "Erreur réseau. Impossible de se connecter au serveur.";
      } else if (err.message) {
          errorMsg = err.message;
      }
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
        <Card className="flex h-48 items-center justify-center">
            <div className="text-center text-destructive">
                <AlertCircle className="mx-auto h-8 w-8" />
                <p className="mt-2 font-semibold">Erreur de chargement</p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
                <Button onClick={fetchTransactions} variant="secondary" className="mt-4">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Réessayer
                </Button>
            </div>
        </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.length > 0 ? (
        transactions.map((tx) => (
          <TransactionCard key={tx.id} tx={tx} />
        ))
      ) : (
        <Card className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Aucune transaction on-chain disponible.</p>
        </Card>
      )}
    </div>
  );
};

// --- Lightning Components ---

const formatSats = (sats: number) => {
  return new Intl.NumberFormat("fr-FR").format(sats);
};

const getLightningStatusVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'succeeded':
       return 'success';
    case 'pending': return 'warning';
    case 'failed':
    case 'expired':
       return 'destructive';
    default: return 'secondary';
  }
}

const getLightningStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
        return <CircleCheck className="size-3.5" />;
      case 'pending': return <Clock className="size-3.5" />;
       case 'failed':
       case 'expired':
        return <CircleX className="size-3.5" />;
      default: return <AlertCircle className="size-3.5" />;
    }
}

const LightningHistory = () => {
    const [transactions, setTransactions] = useState<LightningTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getLightningTransactions();
            const results = response.data.results || response.data || [];
            setTransactions(results);
        } catch (err: any) {
            setError(err.message || "Impossible de charger l'historique des transactions.");
        } finally {
            setLoading(false);
        }
    }, []);

     useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}><CardContent className="p-4"><div className="flex items-center gap-4 h-16">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                      </div>
                  </div></CardContent></Card>
                ))}
            </div>
        )
    }

    if (error) {
        return (
          <Card className="flex h-48 items-center justify-center">
            <div className="p-4 text-center text-destructive border border-destructive/20 bg-destructive/10 rounded-lg">
                <AlertCircle className="mx-auto h-6 w-6" />
                <p className="mt-2 font-semibold">Erreur de chargement</p>
                <p className="text-sm">{error}</p>
                <Button onClick={fetchTransactions} variant="secondary" size="sm" className="mt-4">
                    Réessayer
                </Button>
            </div>
          </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-0">
                <div className="space-y-0">
                    {transactions.length > 0 ? (
                        transactions.map((tx, index) => (
                            <div key={tx.payment_hash || `${index}-${tx.created_at}`}>
                                <div className="flex items-center gap-4 p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                                    {tx.type === "incoming" ? (
                                        <ArrowDownLeft className="size-5 text-green-500" />
                                    ) : (
                                        <ArrowUpRight className="size-5 text-red-500" />
                                    )}
                                    </div>
                                    <div className="flex-1">
                                    <p
                                        className={`font-semibold ${
                                        tx.type === "incoming"
                                            ? "text-green-500"
                                            : "text-red-500"
                                        }`}
                                    >
                                        {tx.type === "incoming" ? "+" : "-"}
                                        {formatSats(tx.amount_sats)} sats
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {tx.memo || (tx.type === 'incoming' ? 'Paiement reçu' : 'Paiement envoyé')}
                                    </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {format(new Date(tx.created_at), "d MMM", { locale: fr })}
                                        </p>
                                        <Badge variant={getLightningStatusVariant(tx.status)} className="capitalize text-xs py-0.5 px-1.5 font-medium">
                                            {getLightningStatusIcon(tx.status)}
                                            <span className="ml-1">{tx.status}</span>
                                        </Badge>
                                    </div>
                                </div>
                                {index < transactions.length - 1 && (
                                    <Separator />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4">Aucune transaction Lightning pour le moment.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}


export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Historique des Transactions</h1>
        <p className="text-muted-foreground">
          Consultez toutes les transactions de votre portefeuille, on-chain et Lightning.
        </p>
      </div>
      
      <Tabs defaultValue="on-chain" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="on-chain">On-Chain</TabsTrigger>
                <TabsTrigger value="lightning">Lightning</TabsTrigger>
            </TabsList>
            <TabsContent value="on-chain" className="pt-4">
                <OnChainTransactions />
            </TabsContent>
            <TabsContent value="lightning" className="pt-4">
                <LightningHistory />
            </TabsContent>
        </Tabs>
    </div>
  );
}
