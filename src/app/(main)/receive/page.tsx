
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "./copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { ShareButton } from "./share-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bitcoin, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Wallet } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ReceivePage() {
  const { toast } = useToast();
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [amount, setAmount] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentUri, setPaymentUri] = useState("");

  const fetchAddress = async () => {
    try {
      const response = await api.get<Wallet[]>("/wallet/");
      if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].address) {
        setAddress(response.data[0].address);
      } else {
        await generateNewAddress();
      }
    } catch (error) {
      console.error("Failed to fetch wallet address, generating new one.", error);
      await generateNewAddress();
    } finally {
      setLoading(false);
    }
  }
  
  const generateNewAddress = async () => {
    setGenerating(true);
    try {
      const response = await api.post<{ address: string }>("/wallet/generate_address/");
      setAddress(response.data.address);
       toast({
        title: "New Address Generated",
        description: "A new receiving address has been created for you.",
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.details?.detail || "Could not generate a new address. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    } finally {
      setGenerating(false);
    }
  }


  useEffect(() => {
    fetchAddress();
  }, []);

  useEffect(() => {
    if (!address) return;

    let uri = `bitcoin:${address}`;
    if (amount && parseFloat(amount) > 0) {
      uri += `?amount=${amount}`;
    }
    setPaymentUri(uri);

    const generateQrCode = async () => {
        try {
            const response = await api.post<{ qr_code: string }>('/wallet/generate_qr_code/', { data: uri });
            setQrCode(response.data.qr_code);
        } catch (error) {
            console.error("Failed to generate QR code from backend, using fallback.", error);
            const fallbackQrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(uri)}&format=png&bgcolor=ffffff`;
            setQrCode(fallbackQrApiUrl);
        }
    };

    generateQrCode();
  }, [amount, address]);


  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Receive Bitcoin</CardTitle>
          <CardDescription>
            Share your address to receive BTC. You can specify an amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            {loading || !qrCode ? (
                <Skeleton className="h-[256px] w-[256px] rounded-md" />
            ) : (
                <Image
                src={qrCode}
                alt="Wallet Address QR Code"
                width={256}
                height={256}
                className="rounded-md"
                data-ai-hint="qr code"
              />
            )}
          </div>
          <div className="w-full max-w-sm space-y-4">
             <div className="relative">
                <Label htmlFor="amount" className="sr-only" >Amount (BTC)</Label>
                <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                    id="amount"
                    type="number"
                    step="0.00000001"
                    placeholder="0.00 (Optional)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 text-center"
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="wallet-address" className="sr-only">
                Wallet Address
                </Label>
                {loading ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Input
                      id="wallet-address"
                      value={address || ''}
                      readOnly
                      className="text-center font-code text-sm"
                    />
                )}
                <p className="text-xs text-muted-foreground">
                  This is your unique Bitcoin address.
                </p>
            </div>
          </div>
         
          <div className="flex w-full max-w-sm flex-col gap-3">
             <div className="flex gap-4">
                <CopyButton text={paymentUri} />
                <ShareButton text={paymentUri} amount={amount} />
             </div>
             <Button variant="outline" size="sm" onClick={generateNewAddress} disabled={generating}>
                <RefreshCw className={cn("mr-2 size-4", generating && "animate-spin")} />
                {generating ? 'Generating...' : 'Generate New Address'}
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
