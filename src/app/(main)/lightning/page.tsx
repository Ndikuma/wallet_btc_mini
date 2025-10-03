"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ArrowUpRight, Camera } from "lucide-react";

// Mock data for the Lightning page
const lightningData = {
  balanceSats: 125000,
  balanceUsd: 52.34,
  transactions: [
    {
      type: "incoming" as const,
      amountSats: 50000,
      memo: "De Alice",
      date: "2 Oct",
    },
    {
      type: "outgoing" as const,
      amountSats: 15000,
      memo: "Café",
      date: "3 Oct",
    },
     {
      type: "incoming" as const,
      amountSats: 75000,
      memo: "Salaire",
      date: "1 Oct",
    },
     {
      type: "outgoing" as const,
      amountSats: 25000,
      memo: "Restaurant",
      date: "28 Sep",
    },
  ],
};

const formatSats = (sats: number) => {
  return new Intl.NumberFormat("fr-FR").format(sats);
};

export default function LightningPage() {
  return (
    <div className="mx-auto max-w-md">
      {/* Balance Section */}
      <div className="py-8 text-center">
        <h1 className="text-5xl font-bold tracking-tighter">
          {formatSats(lightningData.balanceSats)} sats
        </h1>
        <p className="text-muted-foreground">
          ≈ ${lightningData.balanceUsd.toFixed(2)} USD
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button size="lg" className="h-14 rounded-xl bg-green-600 text-lg text-white hover:bg-green-700">
          Générer une facture
        </Button>
        <Button size="lg" className="h-14 rounded-xl bg-blue-600 text-lg text-white hover:bg-blue-700">
          Envoyer un paiement
        </Button>
      </div>

      {/* Scan QR Button - Positioned at the bottom right */}
      <Button
        size="icon"
        className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg md:bottom-8"
      >
        <Camera className="size-8" />
        <span className="sr-only">Scanner un QR code</span>
      </Button>

      {/* Transaction History */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Historique</h2>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4">
              {lightningData.transactions.map((tx, index) => (
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
                        {formatSats(tx.amountSats)} sats
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tx.memo} – {tx.date}
                      </p>
                    </div>
                  </div>
                  {index < lightningData.transactions.length - 1 && (
                    <Separator />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
