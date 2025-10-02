
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShoppingCart, Clock, CircleCheck, CircleX, Hourglass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

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
                <CardTitle className="text-lg capitalize">Itangazo ryo {order.direction === 'buy' ? 'Kugura' : 'Kugurisha'} #{order.id}</CardTitle>
            </div>
            <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status.replace('_', ' ')}</Badge>
        </div>
        <CardDescription>
          {new Date(order.created_at).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm text-muted-foreground">Umutanzi</p>
                <p className="font-semibold">{order.provider.name}</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-muted-foreground">Igiteranyo</p>
                <p className="font-semibold">{order.total_amount} {order.amount_currency}</p>
            </div>
        </div>
      </CardContent>
    </Link>
  </Card>
);

export default function OrdersPage() {
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
      setError(err.message || "Gupakira amatangazo biranse.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Amatangazo Yanje</h1>
        <p className="text-muted-foreground">
          Raba kahise n'ingene amatangazo yawe yo kugura no kugurisha ahagaze.
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Card className="flex h-48 items-center justify-center">
          <div className="text-center text-destructive">
            <AlertCircle className="mx-auto h-8 w-8" />
            <p className="mt-2 font-semibold">Ikosa mu gupakira amatangazo</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
            <Button onClick={fetchOrders} variant="secondary" className="mt-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" hidden={!loading}/>
              Subira Ugerageze
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && (
         <div className="space-y-4">
            {orders.length > 0 ? (
                orders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
                <Card className="flex h-48 items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Ntamatangazo uragira.</p>
                    <Button asChild className="mt-4">
                        <Link href="/buy">Gura Bitcoin</Link>
                    </Button>
                </div>
                </Card>
            )}
        </div>
      )}
    </div>
  );
}
