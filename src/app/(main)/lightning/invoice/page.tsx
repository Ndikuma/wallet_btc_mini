
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/copy-button";
import { Skeleton } from "@/components/ui/skeleton";

const mockInvoice = "lnbc15u1p3xnhl2pp5j5za6e3s3p2h4p4y3j5z6k2g9q9q9q9q9q9q9q9q9q9q9q9q9q9qsq9qsqqqqqqqqqqqqqqqqqsqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

export default function GenerateInvoicePage() {
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [invoice, setInvoice] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call to generate invoice
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setInvoice(mockInvoice);
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${mockInvoice}`);
    setIsLoading(false);
  };
  
  const handleReset = () => {
    setAmount("");
    setMemo("");
    setInvoice(null);
    setQrCode(null);
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Button variant="ghost" asChild className="-ml-4">
        <Link href="/lightning">
          <ArrowLeft className="mr-2 size-4" />
          Retour
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="text-primary" />
            Générer une facture Lightning
          </CardTitle>
          <CardDescription>
            Créez une facture pour recevoir un paiement via le Lightning Network.
          </CardDescription>
        </CardHeader>
        
        {invoice ? (
          <CardContent className="flex flex-col items-center gap-6">
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                {qrCode ? (
                    <Image
                    src={qrCode}
                    alt="Code QR de la facture Lightning"
                    width={256}
                    height={256}
                    className="rounded-md"
                    data-ai-hint="qr code"
                />
                ) : (
                    <Skeleton className="h-64 w-64" />
                )}
              </div>
              <div className="w-full space-y-2">
                <Label>Facture Lightning</Label>
                <div className="break-all rounded-md border bg-secondary p-3 font-mono text-sm text-muted-foreground">
                  {invoice}
                </div>
              </div>
              <CopyButton textToCopy={invoice} toastMessage="Facture copiée dans le presse-papiers">
                Copier la facture
              </CopyButton>
          </CardContent>
        ) : (
          <form onSubmit={handleGenerate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (sats)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memo">Mémo (optionnel)</Label>
                <Input
                  id="memo"
                  type="text"
                  placeholder="Ex: Pour le café"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Génération en cours..." : "Générer la facture"}
              </Button>
            </CardFooter>
          </form>
        )}
        
        {invoice && (
            <CardFooter>
                 <Button variant="outline" className="w-full" onClick={handleReset}>Créer une autre facture</Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
