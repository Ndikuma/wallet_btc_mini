
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { useState, useEffect, useCallback } from "react";
import { ShareButton } from "./share-button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function ReceivePage() {
  const { toast } = useToast();
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateNewAddressFn = useCallback(async (isInitial = false) => {
    if (!isInitial) setGenerating(true);
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateNewAddress();
      setAddress(response.data.address);
      if (!isInitial) {
         toast({
          title: "New Address Generated",
          description: "A new receiving address has been created for you.",
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || "Could not generate a new address. Please try again.";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    } finally {
      if (!isInitial) setGenerating(false);
      setLoading(false);
    }
  }, [toast]);
  
  const fetchAddress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getWallets();
      if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].address) {
        setAddress(response.data[0].address);
      } else {
        await generateNewAddressFn(true); // First time generation
      }
    } catch (error) {
      await generateNewAddressFn(true);
    } finally {
      setLoading(false);
    }
  }, [generateNewAddressFn]);

  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);

  useEffect(() => {
    if (!address) return;

    const uri = `bitcoin:${address}`;

    const generateQrCodeFn = async () => {
        try {
            const response = await api.generateQrCode(uri);
            setQrCode(response.data.qr_code);
        } catch (error) {
            console.error("Failed to generate QR code from backend, using fallback.", error);
            const fallbackQrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(uri)}&format=png&bgcolor=ffffff`;
            setQrCode(fallbackQrApiUrl);
        }
    };

    generateQrCodeFn();
  }, [address]);


  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Receive Bitcoin</CardTitle>
          <CardDescription>
            Share your address to receive BTC.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="rounded-lg border bg-white p-4 shadow-sm min-h-[288px] min-w-[288px] flex items-center justify-center">
            {loading ? (
                <Skeleton className="h-[256px] w-[256px] rounded-md" />
            ) : error ? (
                 <div className="text-center text-destructive p-4">
                    <AlertCircle className="mx-auto h-8 w-8" />
                    <p className="mt-2 font-semibold">Error Generating Address</p>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
                    <Button onClick={fetchAddress} variant="secondary" className="mt-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" hidden={!loading}/>
                        Try Again
                    </Button>
                </div>
            ) : qrCode ? (
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
          
          <div className="w-full space-y-4">
            <div className="text-sm text-muted-foreground break-all font-code p-3 rounded-md bg-secondary border text-center">
                {loading ? <Skeleton className="h-5 w-4/5 mx-auto" /> : address || '...'}
            </div>
          </div>
         
          <div className="flex w-full flex-col gap-3">
             <div className="grid grid-cols-2 gap-3">
                <CopyButton 
                  textToCopy={address || ''} 
                  disabled={loading || !address || !!error} 
                  toastMessage="Address copied to clipboard"
                  variant="outline"
                >
                  Copy Address
                </CopyButton>
                <ShareButton 
                  shareData={{ title: "My Bitcoin Address", text: address || '' }} 
                  disabled={loading || !address || !!error}
                  variant="outline"
                >
                  Share Address
                </ShareButton>
             </div>

             <Separator />
             
             <Button variant="ghost" size="sm" onClick={() => generateNewAddressFn(false)} disabled={generating || loading || !!error}>
                <RefreshCw className={cn("mr-2 size-4", generating && "animate-spin")} />
                {generating ? 'Generating...' : 'Generate New Address'}
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
