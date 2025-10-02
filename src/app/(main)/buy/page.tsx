
"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { BuyProvider } from "@/lib/types";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, Landmark, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ProviderCard = ({ provider }: { provider: BuyProvider }) => (
  <Link href={`/buy/${provider.id}`} className="block h-full transition-all rounded-lg hover:shadow-lg hover:-translate-y-1">
    <Card className="h-full flex flex-col hover:border-primary/50">
      <CardHeader className="flex-grow">
        <div className="flex items-start gap-4">
          {provider.image ? (
              <Image
              src={provider.image}
              alt={`${provider.name} logo`}
              width={48}
              height={48}
              className="rounded-lg border"
              />
          ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-secondary">
                  <Landmark className="size-6 text-muted-foreground" />
              </div>
          )}
          <div className="flex-1">
            <CardTitle>{provider.name}</CardTitle>
            <CardDescription>{provider.description}</CardDescription>
          </div>
          <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
    </Card>
  </Link>
);

export default function BuyPage() {
  const [providers, setProviders] = useState<BuyProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getBuyProviders();
      setProviders(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load buy providers. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Buy Bitcoin</h1>
        <p className="text-muted-foreground">
          Choose a provider to make a payment and receive Bitcoin in your wallet.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row items-start gap-4">
                     <Skeleton className="h-12 w-12 rounded-lg" />
                     <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                     </div>
                </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="flex h-48 items-center justify-center">
          <div className="text-center text-destructive">
            <AlertCircle className="mx-auto h-8 w-8" />
            <p className="mt-2 font-semibold">Error Loading Providers</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
            <Button onClick={fetchProviders} variant="secondary" className="mt-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" hidden={!loading}/>
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {providers.length > 0 ? (
            providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))
          ) : (
            <Card className="col-span-full flex h-48 items-center justify-center">
              <p className="text-muted-foreground">No buy providers are available at this time.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
