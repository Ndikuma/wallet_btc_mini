
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { BuyProvider } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, Landmark } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const ProviderCard = ({ provider }: { provider: BuyProvider }) => (
  <Card className="hover:border-primary/50 transition-colors">
    <Link href={`/buy/${provider.id}`} className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-start gap-4">
        {provider.logo_url ? (
            <Image
            src={provider.logo_url}
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
        <div>
          <CardTitle>{provider.name}</CardTitle>
          <CardDescription>{provider.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
         <div className="flex flex-wrap gap-2">
            {(provider.currencies || []).map((currency) => (
              <Badge key={currency} variant="secondary">{currency.toUpperCase()}</Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button variant="ghost" className="w-full justify-start p-0 h-auto text-primary">
            Select Provider
            <ArrowRight className="ml-2 size-4" />
        </Button>
      </CardFooter>
    </Link>
  </Card>
);

export default function BuyPage() {
  const [providers, setProviders] = useState<BuyProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await api.getBuyProviders();
        setProviders(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load buy providers. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Buy Bitcoin</h1>
        <p className="text-muted-foreground">
          Choose one of our trusted providers to purchase Bitcoin.
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
                 <CardContent>
                     <Skeleton className="h-5 w-24" />
                </CardContent>
                <CardFooter>
                     <Skeleton className="h-6 w-28" />
                </CardFooter>
            </Card>
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
