
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef, useEffect, useCallback } from "react";
import jsQR from "jsqr";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpRight, Bitcoin, ScanLine, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Balance, FeeEstimation } from "@/lib/types";
import { AxiosError } from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/settings-context";

const formSchema = (balance: number) => z.object({
  recipient: z
    .string()
    .min(26, { message: "Bitcoin address is too short." })
    .max(62, { message: "Bitcoin address is too long." }),
  amount: z.coerce
    .number({invalid_type_error: "Please enter a valid number."})
    .positive({ message: "Amount must be positive." })
    .max(balance, { message: `Insufficient balance. Available: ${balance.toFixed(8)} BTC` }),
});

export type SendFormValues = z.infer<ReturnType<typeof formSchema>>;


export function SendForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { settings } = useSettings();

  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);

  const [feeEstimation, setFeeEstimation] = useState<FeeEstimation | null>(null);
  const [isEstimatingFee, setIsEstimatingFee] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  
  const currentBalance = balance ? parseFloat(balance.balance) : 0;

  const form = useForm<SendFormValues>({
    resolver: zodResolver(formSchema(currentBalance)),
    defaultValues: { recipient: "", amount: undefined },
    mode: "onChange",
  });

  const watchedAmount = form.watch("amount");
  const watchedRecipient = form.watch("recipient");
  const debouncedAmount = useDebounce(watchedAmount, 500);

  const estimateFee = useCallback(async (amount: number) => {
      setIsEstimatingFee(true);
      setFeeError(null);
      try {
          const feeResponse = await api.estimateFee({ amount });
          setFeeEstimation(feeResponse.data);
      } catch (error: any) {
          const errorMsg = error.response?.data?.error || "Could not estimate network fee.";
          setFeeError(errorMsg);
          setFeeEstimation(null);
      } finally {
          setIsEstimatingFee(false);
      }
  }, []);

  useEffect(() => {
    const recipientState = form.getFieldState('recipient');
    if (debouncedAmount > 0 && !recipientState.invalid && watchedRecipient) {
      estimateFee(debouncedAmount);
    } else {
      setFeeEstimation(null);
      setFeeError(null);
    }
  }, [debouncedAmount, watchedRecipient, form, estimateFee])


  useEffect(() => {
    async function fetchBalance() {
      setIsBalanceLoading(true);
      try {
        const response = await api.getWalletBalance();
        setBalance(response.data);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
            toast({ variant: "destructive", title: "Authentication Error", description: "Please log in to send Bitcoin." });
            router.push("/login");
        } else if (error instanceof AxiosError && error.code === 'ERR_NETWORK') {
            toast({ variant: "destructive", title: "Network Error", description: "Could not connect to the backend to fetch balance." });
        }
        else {
             toast({ variant: "destructive", title: "Error", description: "Could not fetch wallet data." });
        }
      } finally {
        setIsBalanceLoading(false);
      }
    }
    fetchBalance();
  }, [router, toast]);
  
  useEffect(() => {
    const newBalance = balance ? parseFloat(balance.balance) : 0;
    (form.control as any)._resolver = zodResolver(formSchema(newBalance));
     if (form.formState.isDirty) {
      form.trigger("amount");
    }
  }, [balance, form]);


   useEffect(() => {
    if (!isScanning) return;

    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const scanQRCode = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            const address = code.data.replace(/^bitcoin:/, "").split("?")[0];
            form.setValue("recipient", address, { shouldValidate: true });
            toast({ title: "QR Code Scanned", description: `Recipient address set.` });
            setIsScanning(false);
            return; 
          }
        }
      }
      animationFrameId = requestAnimationFrame(scanQRCode);
    };

    const startScan = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          animationFrameId = requestAnimationFrame(scanQRCode);
        }
      } catch (error) {
        setHasCameraPermission(false);
      }
    };

    startScan();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning, toast, form]);

  const handleSetAmount = (percentage: number) => {
    const newAmount = currentBalance * percentage;
    form.setValue("amount", parseFloat(newAmount.toFixed(8)), { shouldValidate: true, shouldDirty: true });
  };

  async function onSubmit(values: SendFormValues) {
    if (!feeEstimation) {
        toast({ variant: "destructive", title: "Cannot Send", description: "Waiting for fee estimation to complete." });
        return;
    }
    setIsLoading(true);
    try {
        const response = await api.sendTransaction({
            recipient: values.recipient,
            amount: parseFloat(feeEstimation.sendable_btc)
        });
        toast({
            title: (response.data as any).message || "Transaction Submitted",
            description: `Sending ${feeEstimation.sendable_btc} BTC.`,
        });
        setIsSuccessDialogOpen(true);
    } catch(error: any) {
        const errorDetails = error.response?.data?.error?.details;
        const errorMsg = errorDetails?.error || errorDetails?.non_field_errors?.[0] || error.response?.data?.message || "An unexpected error occurred.";
        toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: errorMsg,
        });
    } finally {
        setIsLoading(false);
    }
  }

  const getFiat = (val: number, currency: string) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(val);
  }

  if (isBalanceLoading) {
    return (
        <div className="space-y-8">
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <Skeleton className="h-11 w-full" />
        </div>
    )
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Address</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input placeholder="bc1q..." {...field} className="pr-10"/>
                  </FormControl>
                  <Dialog open={isScanning} onOpenChange={setIsScanning}>
                    <DialogTrigger asChild>
                       <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"><ScanLine className="size-5" /><span className="sr-only">Scan QR</span></Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader className="text-center">
                        <DialogTitle>Scan QR Code</DialogTitle>
                        <DialogDescription>Point camera at a Bitcoin address QR code.</DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full aspect-square bg-muted rounded-md overflow-hidden">
                           <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                           <canvas ref={canvasRef} className="hidden" />
                           <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none"><div className="w-2/3 h-2/3 border-4 border-primary rounded-lg" /></div>
                        </div>
                        {hasCameraPermission === false && (
                          <Alert variant="destructive"><AlertTitle>Camera Access Required</AlertTitle><AlertDescription>Please allow camera access to use this feature.</AlertDescription></Alert>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                 <div className="flex items-center justify-between">
                    <FormLabel>Amount to Send</FormLabel>
                    <span className="text-xs text-muted-foreground">Balance: {currentBalance.toFixed(8)} BTC</span>
                 </div>
                 <div className="relative">
                    <FormControl><Input type="number" step="0.00000001" placeholder="0.00" {...field} value={field.value ?? ""} className="pl-8"/></FormControl>
                    <Bitcoin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 </div>
                 <div className="flex gap-2 pt-1">
                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => handleSetAmount(0.25)}>25%</Button>
                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => handleSetAmount(0.5)}>50%</Button>
                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => handleSetAmount(0.75)}>75%</Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {(isEstimatingFee || feeEstimation || feeError) && (
            <div className="space-y-4 rounded-lg border bg-secondary/30 p-4">
                {isEstimatingFee && <div className="flex items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" /> Estimating fees...</div>}
                {feeError && <div className="text-sm text-center text-destructive">{feeError}</div>}
                {feeEstimation && (
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Network Fee</span>
                            <div className="font-medium text-right font-code">
                              <p>{feeEstimation.network_fee_btc} BTC</p>
                              <p className="text-muted-foreground text-xs">{getFiat(feeEstimation.network_fee_usd, 'usd')} / {getFiat(feeEstimation.network_fee_bif, 'bif')}</p>
                            </div>
                        </div>
                         <div className="border-t border-dashed"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold">You will send</span>
                            <div className="font-bold text-right font-code text-base">
                              <p>{feeEstimation.sendable_btc} BTC</p>
                              <p className="text-muted-foreground text-xs">{getFiat(feeEstimation.sendable_usd, 'usd')} / {getFiat(feeEstimation.sendable_bif, 'bif')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={!form.formState.isValid || isLoading || isEstimatingFee || !feeEstimation}>
            {isLoading ? 'Sending...' : <><ArrowUpRight className="mr-2 size-5" />Send Bitcoin</>}
          </Button>
        </form>
      </Form>
      <Dialog open={isSuccessDialogOpen} onOpenChange={(open) => {
        if (!open) router.push("/dashboard");
        setIsSuccessDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader className="items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"><CheckCircle2 className="size-10 text-green-600 dark:text-green-400" /></div>
              <div className="space-y-2 pt-4">
                  <DialogTitle>Transaction Sent</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Your Bitcoin has been sent. It may take a few moments to confirm.</DialogDescription>
              </div>
          </DialogHeader>
          <DialogClose asChild><Button className="w-full max-w-xs mx-auto">Done</Button></DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
