
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpRight, Bitcoin, ScanLine, CheckCircle2 } from "lucide-react";
import { wallet } from "@/lib/data";
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

const formSchema = z.object({
  recipient: z
    .string()
    .min(26, { message: "Bitcoin address is too short." })
    .max(62, { message: "Bitcoin address is too long." }),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be positive." })
    .max(wallet.balance, { message: "Insufficient balance." }),
  fee: z.array(z.number()).default([50]),
});

const recommendedFee = 50;

export function SendForm() {
  const { toast } = useToast();
  const [feeValue, setFeeValue] = useState(recommendedFee);
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      amount: "" as any,
      fee: [recommendedFee],
    },
  });

   useEffect(() => {
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
            // Remove "bitcoin:" prefix if present
            const address = code.data.replace(/^bitcoin:/, "").split("?")[0];
            form.setValue("recipient", address);
            toast({
              title: "QR Code Scanned",
              description: `Recipient address set.`
            });
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
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    if (isScanning) {
      startScan();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isScanning, toast, form]);

  const handleSetAmount = (percentage: number) => {
    const newAmount = wallet.balance * percentage;
    form.setValue("amount", parseFloat(newAmount.toFixed(8)));
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    
    toast({
      title: "Transaction Submitted",
      description: `Sending ${values.amount} BTC to ${values.recipient.slice(0,10)}...`,
    });
    
    // Simulate network delay
    setTimeout(() => {
       setIsSuccessDialogOpen(true);
       form.reset({ recipient: "", amount: "" as any, fee: [recommendedFee] });
       setFeeValue(recommendedFee);
    }, 2000);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Address</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="bc1q..." {...field} />
                  </FormControl>
                  <Dialog open={isScanning} onOpenChange={setIsScanning}>
                    <DialogTrigger asChild>
                       <Button variant="outline" size="icon" type="button">
                        <ScanLine className="size-5" />
                        <span className="sr-only">Scan QR Code</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                        <DialogDescription>
                          Point your camera at a Bitcoin address QR code.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full aspect-square bg-muted rounded-md overflow-hidden">
                           <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                           <canvas ref={canvasRef} className="hidden" />
                           <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                             <div className="w-2/3 h-2/3 border-4 border-primary rounded-lg" />
                          </div>
                        </div>
                        {hasCameraPermission === false && (
                          <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                              Please allow camera access in your browser settings to use this feature.
                            </AlertDescription>
                          </Alert>
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
                    <FormLabel>Amount</FormLabel>
                    <span className="text-xs text-muted-foreground">
                        Balance: {wallet.balance.toFixed(4)} BTC
                    </span>
                 </div>
                 <div className="relative">
                    <FormControl>
                      <Input type="number" step="0.00000001" placeholder="0.00" {...field} className="pl-8"/>
                    </FormControl>
                    <Bitcoin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 </div>
                 <div className="flex gap-2 pt-1">
                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => handleSetAmount(0.25)}>25%</Button>
                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => handleSetAmount(0.5)}>50%</Button>
                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => handleSetAmount(1)}>Max</Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Transaction Fee (sats/vB) -{" "}
                  <span className="font-bold text-primary">{feeValue}</span>
                </FormLabel>
                <FormControl>
                  <div className="relative pt-2">
                    <Slider
                      min={10}
                      max={200}
                      step={1}
                      defaultValue={[recommendedFee]}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setFeeValue(value[0]);
                      }}
                      value={field.value}
                    />
                    <div className="absolute left-0 -top-2.5 text-xs text-muted-foreground w-full flex justify-center">
                       <div style={{ left: `calc(${((recommendedFee - 10) / (200 - 10)) * 100}% - 12px)`}} className="absolute flex flex-col items-center">
                          <div className="h-2 w-px bg-primary"></div>
                          <span className="text-primary font-medium">Recommended</span>
                       </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" size="lg">
            <ArrowUpRight className="mr-2 size-5" />
            Send Bitcoin
          </Button>
        </form>
      </Form>
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
            <DialogHeader className="items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle2 className="size-10 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2 pt-4">
                    <DialogTitle>Transaction Sent</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Your Bitcoin has been sent successfully. It may take a few moments to confirm on the network.
                    </DialogDescription>
                </div>
            </DialogHeader>
            <DialogClose asChild>
                <Button className="w-full max-w-xs mx-auto">Done</Button>
            </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
