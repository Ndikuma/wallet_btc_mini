
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
import { Bitcoin } from "lucide-react";
import api from "@/lib/api";
import type { Wallet } from "@/lib/types";

export default function ReceivePage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentUri, setPaymentUri] = useState("");

  useEffect(() => {
    async function fetchWallet() {
      try {
        const response = await api.get("/wallets/");
        setWallet(response.data);
        setPaymentUri(response.data.address);
      } catch (error) {
        console.error("Failed to fetch wallet address", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWallet();
  }, []);

  useEffect(() => {
    if (!wallet?.address) return;

    let uri = `bitcoin:${wallet.address}`;
    if (amount && parseFloat(amount) > 0) {
      uri += `?amount=${amount}`;
    }
    setPaymentUri(uri);

    const fetchQrCode = () => {
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(uri)}&format=png&bgcolor=ffffff`;
        setQrCode(qrApiUrl);
    };

    fetchQrCode();
  }, [amount, wallet?.address]);


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
                      value={wallet?.address || ''}
                      readOnly
                      className="text-center font-code text-sm"
                    />
                )}
                <p className="text-xs text-muted-foreground">
                  This is your unique Bitcoin address.
                </p>
            </div>
          </div>
         
          <div className="flex gap-4">
             <CopyButton text={paymentUri} />
             <ShareButton text={paymentUri} amount={amount} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
