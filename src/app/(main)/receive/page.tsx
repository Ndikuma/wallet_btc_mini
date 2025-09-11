"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { wallet } from "@/lib/data";
import { CopyButton } from "./copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { ShareButton } from "./share-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReceivePage() {
  const [amount, setAmount] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentUri, setPaymentUri] = useState(wallet.address);

  useEffect(() => {
    let uri = `bitcoin:${wallet.address}`;
    if (amount && parseFloat(amount) > 0) {
      uri += `?amount=${amount}`;
    }
    setPaymentUri(uri);

    const fetchQrCode = async () => {
      try {
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(uri)}&bgcolor=F5F5F5&format=png`;
        const response = await fetch(qrApiUrl);
        if (!response.ok) throw new Error("Failed to fetch QR code");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setQrCode(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error generating QR code:", error);
        setQrCode(null);
      }
    };

    fetchQrCode();
  }, [amount]);


  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Receive Bitcoin</CardTitle>
          <CardDescription>
            Share your address or QR code to receive payments. You can also specify an amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            {qrCode ? (
                <Image
                src={qrCode}
                alt="Wallet Address QR Code"
                width={256}
                height={256}
                className="rounded-md"
                data-ai-hint="qr code"
              />
            ) : (
                <Skeleton className="h-[256px] w-[256px] rounded-md" />
            )}
          </div>
          <div className="w-full max-w-sm space-y-4">
             <div className="space-y-2">
                <Label htmlFor="amount" >Amount (BTC)</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.00000001"
                    placeholder="Optional amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-center"
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="wallet-address" className="sr-only">
                Wallet Address
                </Label>
                <Input
                id="wallet-address"
                value={wallet.address}
                readOnly
                className="text-center font-code text-sm"
                />
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
