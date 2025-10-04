
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ArrowUpRight, Camera, Loader2, AlertCircle, ArrowDownLeft } from "lucide-react";
import api from "@/lib/api";
import type { LightningBalance, LightningTransaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getFiat } from "@/lib/utils";


const formatSats = (sats: number) => {
  return new Intl.NumberFormat("fr-FR").format(sats);
};

export default function LightningPage() {
    const [balance, setBalance] = useState<LightningBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [transactions, setTransactions] = useState<LightningTransaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsError, setTransactionsError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getLightningBalance();
            setBalance(response.data);
        } catch (err: any) {
            setError(err.message || "Impossible de charger le solde Lightning.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        setLoadingTransactions(true);
        setTransactionsError(null);
        try {
            const response = await api.getLightningTransactions();
            setTransactions(response.data.results || response.data);
        } catch (err: any) {
            setTransactionsError(err.message || "Impossible de charger l'historique des transactions.");
        } finally {
            setLoadingTransactions(false);
        }
    }, []);

    useEffect(() => {
        fetchBalance();
        fetchTransactions();
    }, [fetchBalance, fetchTransactions]);

  return (
    <div className="mx-auto max-w-md">
      {/* Balance Section */}
      <div className="py-8 text-center">
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-14 w-48 mx-auto" />
                <Skeleton className="h-5 w-36 mx-auto mt-2" />
            </div>
        ) : error ? (
             <div className="text-center text-destructive p-4 border border-destructive/50 rounded-lg">
                <AlertCircle className="mx-auto h-8 w-8" />
                <p className="mt-2 font-semibold">Erreur de chargement</p>
                <p className="text-sm">{error}</p>
                <Button onClick={fetchBalance} variant="destructive" size="sm" className="mt-4">
                    Réessayer
                </Button>
            </div>
        ) : balance ? (
            <div className="space-y-2">
                <h1 className="text-5xl font-bold tracking-tighter">
                {formatSats(balance.balance)} {balance.currency}
                </h1>
                <div className="flex justify-center items-center gap-4 text-muted-foreground">
                    {balance.balance_usd !== undefined && <p>{getFiat(balance.balance_usd, 'USD')}</p>}
                    {balance.balance_usd !== undefined && balance.balance_bif !== undefined && <span>•</span>}
                    {balance.balance_bif !== undefined && <p>{getFiat(balance.balance_bif, 'BIF')}</p>}
                </div>
            </div>
        ) : (
             <p className="text-muted-foreground">Aucun solde disponible.</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button asChild size="lg" className="h-14 rounded-xl bg-green-600 text-lg text-white hover:bg-green-700">
          <Link href="/lightning/invoice">Générer une facture</Link>
        </Button>
        <Button asChild size="lg" className="h-14 rounded-xl bg-blue-600 text-lg text-white hover:bg-blue-700">
          <Link href="/lightning/send">Envoyer un paiement</Link>
        </Button>
      </div>

      {/* Scan QR Button - Positioned at the bottom right */}
      <Button
        size="icon"
        asChild
        className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg md:bottom-8"
      >
        <Link href="/lightning/send">
          <Camera className="size-8" />
          <span className="sr-only">Scanner un QR code</span>
        </Link>
      </Button>

      {/* Transaction History */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Historique</h2>
        <Card>
          <CardContent className="p-0">
            {loadingTransactions ? (
                <div className="p-4 space-y-4">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : transactionsError ? (
                <div className="p-8 text-center text-destructive">
                    <AlertCircle className="mx-auto h-8 w-8" />
                    <p className="mt-2 font-semibold">Erreur de chargement</p>
                    <p className="text-sm">{transactionsError}</p>
                    <Button onClick={fetchTransactions} variant="secondary" size="sm" className="mt-4">
                        Réessayer
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                {transactions.map((tx, index) => (
                    <React.Fragment key={tx.payment_hash || `${index}-${tx.created_at}`}>
                    <div className="flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                        {tx.type === "incoming" ? (
                            <ArrowDownLeft className="size-6 text-green-500" />
                        ) : (
                            <ArrowUpRight className="size-6 text-red-500" />
                        )}
                        </div>
                        <div className="flex-1">
                        <p
                            className={`font-bold ${
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
                         <div className="text-right">
                             <p className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                               Frais: {tx.fee_sats} sats
                            </p>
                         </div>
                    </div>
                    {index < transactions.length - 1 && (
                        <Separator />
                    )}
                    </React.Fragment>
                ))}
                {transactions.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                    Aucune transaction pour le moment.
                    </div>
                )}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
