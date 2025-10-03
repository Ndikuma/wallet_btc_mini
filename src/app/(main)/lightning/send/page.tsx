
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import jsQR from "jsqr";
import { ArrowLeft, ScanLine, Send, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function SendPaymentPage() {
  const { toast } = useToast();
  const [invoice, setInvoice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) {
        toast({ variant: "destructive", title: "Facture manquante", description: "Veuillez coller ou scanner une facture."})
        return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);
    toast({ title: "Paiement réussi !", description: "Votre paiement a été envoyé."});
  };
  
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
            setInvoice(code.data);
            toast({ title: "Facture scannée", description: `La facture a été collée dans le champ.` });
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
  }, [isScanning, toast]);


  if (isSuccess) {
    return (
        <div className="mx-auto max-w-md space-y-6 text-center">
            <Card className="p-8">
                <CheckCircle2 className="mx-auto size-20 text-green-500" />
                <CardHeader>
                    <CardTitle className="text-2xl">Paiement Envoyé</CardTitle>
                    <CardDescription>Votre transaction a été complétée avec succès.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/lightning">Retour au portefeuille Lightning</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
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
            <Send className="text-primary" />
            Envoyer un paiement Lightning
          </CardTitle>
          <CardDescription>
            Collez une facture ou utilisez votre caméra pour scanner un code QR.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePay}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice">Facture Lightning</Label>
              <Textarea
                id="invoice"
                placeholder="lnbc..."
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                required
                rows={5}
                className="font-mono"
                disabled={isLoading}
              />
            </div>
             <Dialog open={isScanning} onOpenChange={setIsScanning}>
                <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="w-full">
                        <ScanLine className="mr-2 size-4" />
                        Scanner un QR code
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center">
                    <DialogTitle>Scanner le QR de la facture</DialogTitle>
                    <DialogDescription>Pointez votre caméra vers un code QR Lightning.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full aspect-square bg-muted rounded-md overflow-hidden">
                        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none"><div className="w-2/3 h-2/3 border-4 border-primary rounded-lg" /></div>
                    </div>
                    {hasCameraPermission === false && (
                        <Alert variant="destructive"><AlertTitle>Permission de caméra requise</AlertTitle><AlertDescription>Veuillez autoriser l'accès à la caméra pour utiliser cette fonctionnalité.</AlertDescription></Alert>
                    )}
                    </div>
                </DialogContent>
            </Dialog>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || !invoice}>
              {isLoading ? "Envoi en cours..." : "Payer la facture"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
