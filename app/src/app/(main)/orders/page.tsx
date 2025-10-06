
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import api from "@/lib/api";
import type { Order, LightningTransaction } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertCircle,
    ShoppingCart,
    Clock,
    CircleCheck,
    CircleX,
    Hourglass,
    Loader2,
    Zap,
    ArrowDownLeft,
    ArrowUpRight,
    ChevronDown,
    Copy,
    ExternalLink,
    Hash,
    Landmark,
    CalendarClock,
    Bitcoin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, shortenText } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";


const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'paid':
    case 'succeeded':
       return 'success';
    case 'pending':
    case 'awaiting_confirmation':
       return 'warning';
    case 'failed':
    case 'expired':
    case 'cancelled':
       return 'destructive';
    default: return 'secondary';
  }
}

const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'succeeded':
        return <CircleCheck className="size-4" />;
      case 'pending': return <Clock className="size-4" />;
      case 'awaiting_confirmation': return <Hourglass className="size-4" />;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return <CircleX className="size-4" />;
      default: return <ShoppingCart className="size-4" />;
    }
}

const OrderCard = ({ order }: { order: Order }) => (
  <Card className="hover:border-primary/50 transition-colors">
    <Link href={`/orders/${order.id}`} className="block h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {order.payment_method === 'lightning' ? <Zap className="size-4" /> : <Bitcoin className="size-4" />}
                <CardTitle className="text-lg capitalize">Commande #{order.id}</CardTitle>
            </div>
            <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status.replace(/_/g, ' ')}</Badge>
        </div>
        <CardDescription>
          {new Date(order.created_at).toLocaleString('fr-FR')} - {order.direction === 'buy' ? 'Achat' : 'Vente'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm text-muted-foreground">Fournisseur</p>
                <p className="font-semibold">{order.provider.name}</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold">{order.total_amount} {order.amount_currency}</p>
            </div>
        </div>
      </CardContent>
    </Link>
  </Card>
);

const OnChainOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getOrders({ payment_method: 'on_chain' });
      setOrders(response.data.results || []);
    } catch (err: any) {
      setError(err.message || "Échec du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
        <Card className="flex h-48 items-center justify-center">
          <div className="text-center text-destructive">
            <AlertCircle className="mx-auto h-8 w-8" />
            <p className="mt-2 font-semibold">Erreur de chargement des commandes</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
            <Button onClick={fetchOrders} variant="secondary" className="mt-4">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Réessayer
            </Button>
          </div>
        </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.length > 0 ? (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
      ) : (
          <Card className="flex h-48 items-center justify-center">
          <div className="text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Vous n'avez aucune commande on-chain.</p>
              <Button asChild className="mt-4">
                  <Link href="/buy">Acheter des Bitcoins</Link>
              </Button>
          </div>
          </Card>
      )}
    </div>
  );
}


const DetailRow = ({ icon: Icon, label, value, children, isCopyable = true }: { icon: React.ElementType, label: string, value?: string | null, children?: React.ReactNode, isCopyable?: boolean }) => {
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
            {value && isCopyable && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCopy}><Copy className="size-3.5" /></Button>}
          </div>
        )}
      </div>
    </div>
  )
}

const formatSats = (sats: number) => {
  return new Intl.NumberFormat("fr-FR").format(sats);
};

const getLightningStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
      case 'confirmed':
        return CircleCheck;
      case 'pending': return Clock;
       case 'failed':
       case 'expired':
        return CircleX;
      default: return AlertCircle;
    }
}

const LightningTransactionCard = ({ tx }: { tx: LightningTransaction }) => {
    const isIncoming = tx.type === "incoming";
    const StatusIcon = getLightningStatusIcon(tx.status);

    return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <Accordion type="single" collapsible>
          <AccordionItem value={tx.payment_hash} className="border-b-0">
            <AccordionTrigger className="p-4 hover:no-underline">
              <div className="flex flex-1 items-center gap-4">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Zap className="size-5 text-primary" />
                 </div>
                 <div className="flex-1 grid gap-1 text-left">
                   <p className="font-medium truncate">
                      {tx.memo || (isIncoming ? 'Paiement reçu' : 'Paiement envoyé')}
                   </p>
                   <p className="text-sm text-muted-foreground">
                      {format(parseISO(tx.created_at), "d MMMM yyyy", { locale: fr })}
                   </p>
                 </div>
                 <div className="text-right">
                    <p className={cn("font-semibold font-mono", isIncoming ? "text-green-500" : "text-red-500")}>
                        {isIncoming ? '+' : '-'}{formatSats(tx.amount_sats)} sats
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
                  <DetailRow icon={StatusIcon} label="Statut">
                     <Badge variant={getStatusVariant(tx.status)} className="capitalize text-sm">{tx.status}</Badge>
                  </DetailRow>
                  <DetailRow icon={CalendarClock} label="Date & Heure">
                     <p className="text-sm font-semibold">{format(parseISO(tx.created_at), "d MMMM yyyy, HH:mm:ss", { locale: fr })}</p>
                  </DetailRow>
                  <DetailRow icon={Zap} label="Frais Lightning" value={`${tx.fee_sats} sats`} isCopyable={false} />
                  <DetailRow icon={Hash} label="Hash de Paiement" value={tx.payment_hash} />
                </div>
                 {tx.memo && <p className="text-sm text-muted-foreground italic">Mémo: {tx.memo}</p>}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
    )
}

const LightningOrders = () => {
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
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        )
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
        )
    }

    return (
        <div className="space-y-4">
            {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                    <LightningTransactionCard key={tx.payment_hash || index} tx={tx} />
                ))
            ) : (
                <Card className="flex h-48 items-center justify-center">
                    <div className="p-8 text-center text-muted-foreground">
                        <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4">Aucune commande ou transaction Lightning pour le moment.</p>
                         <Button asChild className="mt-4">
                            <Link href="/lightning">Aller au Portefeuille Lightning</Link>
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}


export default function OrdersPage() {

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Mes Commandes</h1>
        <p className="text-muted-foreground">
          Suivez vos commandes on-chain et vos transactions Lightning.
        </p>
      </div>

       <Tabs defaultValue="on-chain" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="on-chain">On-Chain</TabsTrigger>
                <TabsTrigger value="lightning">Lightning</TabsTrigger>
            </TabsList>
            <TabsContent value="on-chain" className="pt-4">
                <OnChainOrders />
            </TabsContent>
            <TabsContent value="lightning" className="pt-4">
                <LightningOrders />
            </TabsContent>
        </Tabs>
    </div>
  );
}
