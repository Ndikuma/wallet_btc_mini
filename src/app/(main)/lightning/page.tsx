
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ArrowUpRight, Camera, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import type { LightningBalance, LightningTransaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for transactions until the backend is ready
const mockTransactions: LightningTransaction[] = [
    {
      type: "incoming",
      amount_sats: 50000,
      fee_sats: 0,
      memo: "De Alice",
      status: "succeeded",
      created_at: "2023-10-02T10:00:00Z",
      payment_hash: "hash1"
    },
    {
      type: "outgoing",
      amount_sats: 15000,
      fee_sats: 5,
      memo: "Café",
      status: "succeeded",
      created_at: "2023-10-03T11:00:00Z",
      payment_hash: "hash2"
    },
     {
      type: "incoming",
      amount_sats: 75000,
      fee_sats: 0,
      memo: "Salaire",
      status: "succeeded",
      created_at: "2023-10-01T12:00:00Z",
      payment_hash: "hash3"
    },
     {
      type: "outgoing",
      amount_sats: 25000,
      fee_sats: 10,
      memo: "Restaurant",
      status: "succeeded",
      created_at: "2023-09-28T13:00:00Z",
      payment_hash: "hash4"
    },
  ];


const formatSats = (sats: number) => {
  return new Intl.NumberFormat("fr-FR").format(sats);
};

export default function LightningPage() {
    const [balance, setBalance] = useState<LightningBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<LightningTransaction[]>(mockTransactions);

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

    useEffect(() => {
        fetchBalance();
        // Here you would also fetch transactions, for now we use mock data
        // fetchTransactions();
    }, [fetchBalance]);

  return (
    <div className="mx-auto max-w-md">
      {/* Balance Section */}
      <div className="py-8 text-center">
        {loading ? (
            <>
                <Skeleton className="h-14 w-48 mx-auto" />
                <Skeleton className="h-5 w-24 mx-auto mt-2" />
            </>
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
            <>
                <h1 className="text-5xl font-bold tracking-tighter">
                {formatSats(balance.balance)} {balance.currency}
                </h1>
            </>
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
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                      {tx.type === "incoming" ? (
                        <CheckCircle2 className="size-6 text-green-500" />
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
                      <p className="text-sm text-muted-foreground">
                        {tx.memo} – {new Date(tx.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
