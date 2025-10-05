
"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { BuyProvider } from "@/lib/types";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, Landmark, Loader2, Zap, Construction, Bitcoin } from "lucide-react";
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


const OnChainBuy = () => {
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
      setError(err.message || "Échec du chargement des fournisseurs d'achat. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  if (loading) {
    return (
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
    )
  }

  if (error) {
    return (
      <Card className="flex h-48 items-center justify-center">
        <div className="text-center text-destructive">
          <AlertCircle className="mx-auto h-8 w-8" />
          <p className="mt-2 font-semibold">Erreur de chargement des fournisseurs</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
          <Button onClick={fetchProviders} variant="secondary" className="mt-4">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Réessayer
          </Button>
        </div>
      </Card>
    )
  }

  return (
     <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Fournisseurs On-Chain</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {providers.length > 0 ? (
            providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))
          ) : (
            <Card className="col-span-full flex h-48 items-center justify-center">
              <p className="text-muted-foreground">Aucun fournisseur d'achat n'est disponible pour le moment.</p>
            </Card>
          )}
        </div>
      </div>
  )
}

const LightningBuy = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Fournisseurs Lightning</h2>
            <Card className="col-span-full flex h-48 items-center justify-center text-center">
                <div className="space-y-4">
                    <Construction className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                        <h3 className="text-lg font-semibold">Bientôt Disponible</h3>
                        <p className="text-muted-foreground">L'achat de Bitcoin via Lightning Network sera bientôt disponible.</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default function BuyPage() {
  const [method, setMethod] = useState<"on-chain" | "lightning" | null>(null);

  if (!method) {
    return (
       <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Comment voulez-vous acheter ?</h1>
          <p className="text-muted-foreground">
            Choisissez si vous souhaitez recevoir vos Bitcoins sur la chaîne principale (On-Chain) ou via le Lightning Network.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card onClick={() => setMethod('on-chain')} className="cursor-pointer hover:border-primary transition-colors p-8 flex flex-col items-center justify-center text-center">
                <Bitcoin className="size-12 text-primary mb-4"/>
                <h3 className="font-semibold text-lg">On-Chain</h3>
                <p className="text-sm text-muted-foreground">Transactions standards sur la blockchain Bitcoin. Idéal pour de plus grandes quantités et un stockage à long terme.</p>
            </Card>
             <Card onClick={() => setMethod('lightning')} className="cursor-pointer hover:border-primary transition-colors p-8 flex flex-col items-center justify-center text-center">
                <Zap className="size-12 text-primary mb-4"/>
                <h3 className="font-semibold text-lg">Lightning</h3>
                <p className="text-sm text-muted-foreground">Transactions instantanées avec des frais très bas. Idéal pour les paiements rapides et les petites quantités.</p>
            </Card>
        </div>
      </div>
    )
  }


  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Acheter des Bitcoins ({method === 'on-chain' ? 'On-Chain' : 'Lightning'})</h1>
        <p className="text-muted-foreground">
          {method === 'on-chain' 
            ? "Choisissez un fournisseur pour payer et recevoir des Bitcoins dans votre portefeuille."
            : "Achetez des sats qui seront crédités sur votre solde Lightning."
          }
        </p>
      </div>

      {method === 'on-chain' && <OnChainBuy />}
      {method === 'lightning' && <LightningBuy />}
      
    </div>
  );
}

    