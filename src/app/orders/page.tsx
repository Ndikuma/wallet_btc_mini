

"use client";

import { useState, useEffect } from "react";
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
import { AlertCircle, ShoppingCart, Clock, CircleCheck, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import MainLayout from "@/app/main-layout";

const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
  switch (status.toLowerCase()) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'failed': return 'destructive';
    default: return 'secondary';
  }
}

const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CircleCheck className="size-4 text-green-500" />;
      case 'pending': return <Clock className="size-4 text-yellow-500" />;
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
                <CardTitle className="text-lg capitalize">{order.direction} Order #{order.id}</CardTitle>
            </div>
            <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
        </div>
        <CardDescription>
          {new Date(order.created_at).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm text-muted-foreground">Provider</p>
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

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await api.getOrders();
        setOrders(response || []);
      } catch (err: any) {
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Orders</h1>
        <p className="text-muted-foreground">
          View the history and status of all your buy and sell orders.
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
         <div className="space-y-4">
            {orders.length > 0 ? (
                orders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
                <Card className="flex h-48 items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">You haven't placed any orders yet.</p>
                    <Button asChild className="mt-4">
                        <Link href="/buy">Buy Bitcoin</Link>
                    </Button>
                </div>
                </Card>
            )}
        </div>
      )}
    </div>
  );
}


export default function OrdersLayout() {
    return (
        <MainLayout>
            <OrdersPage />
        </MainLayout>
    )
}
