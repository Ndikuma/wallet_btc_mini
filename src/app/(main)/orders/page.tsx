
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { Order } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ShoppingCart, Clock, CircleCheck, CircleX, Hourglass, Loader2, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
  switch (status.toLowerCase()) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'awaiting_confirmation': return 'warning';
    case 'failed': return 'destructive';
    default: return 'secondary';
  }
}

const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CircleCheck className="size-4 text-green-500" />;
      case 'pending': return <Clock className="size-4 text-yellow-500" />;
      case 'awaiting_confirmation': return <Hourglass className="size-4 text-yellow-500" />;
      case 'failed': return <CircleX className="size-4 text-destructive" />;
      default: return <ShoppingCart className="size-4" />;
    }
}

const OrderCard = ({ order }: { order: Order }) => (
  <Card className="hover:border-primary/50 transition-colors">
    <Link href={`/orders/${order.id}`} className="block h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <CardTitle className="text-lg capitalize">Commande d'{order.direction === 'buy' ? 'Achat' : 'Vente'} #{order.id}</CardTitle>
            </div>
            <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status.replace('_', ' ')}</Badge>
        </div>
        <CardDescription>
          {new Date(order.created_at).toLocaleString('fr-FR')}
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
      const response = await api.getOrders();
      setOrders(response.data.results || response.data);
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

const LightningOrders = () => {
    return (
        <Card className="col-span-full flex h-48 items-center justify-center text-center">
            <div className="space-y-4">
                <Construction className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                    <h3 className="text-lg font-semibold">Bientôt Disponible</h3>
                    <p className="text-muted-foreground">Les commandes Lightning (swaps, etc.) apparaîtront ici.</p>
                </div>
            </div>
        </Card>
    )
}

export default function OrdersPage() {

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Mes Commandes</h1>
        <p className="text-muted-foreground">
          Suivez le statut de vos commandes d'achat et de vente.
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
