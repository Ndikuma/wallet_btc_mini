
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { Balance, SellProvider, FeeEstimation, SellOrderPayload, PayoutData, DecodedLightningRequest, LightningBalance } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bitcoin, Landmark, Loader2, Banknote, Info, User as UserIcon, Phone, Mail, AlertCircle, Check, Zap, Construction, ScanLine, MessageSquare, Wallet, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { getFiat } from "@/lib/utils";
import jsQR from "jsqr";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

const networkSchema = z.object({
    network: z.enum(["on-chain", "lightning"]),
});

const amountSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Veuillez entrer un nombre valide." })
    .positive({ message: "Le montant doit être supérieur à zéro." }),
});

const providerSchema = z.object({
    providerId: z.string({ required_error: "Veuillez sélectionner un fournisseur." }),
});

const paymentDetailsSchema = z.object({
    full_name: z.string().min(1, "Le nom complet est requis."),
    phone_number: z.string().min(1, "Le numéro de téléphone est requis."),
    account_number: z.string().min(1, "Le numéro de compte est requis."),
    email: z.string().email("Veuillez entrer une adresse e-mail valide.").optional(),
})

type FormData = {
    network?: "on-chain" | "lightning";
    amount?: number;
    providerId?: string;
    paymentDetails?: PayoutData;
};

type PaymentStep = "input" | "confirm" | "success";

const LightningSell = () => {
    const { toast } = useToast();
    const router = useRouter();
    const [step, setStep] = useState<PaymentStep>("input");
    const [request, setRequest] = useState("");
    const [decoded, setDecoded] = useState<DecodedLightningRequest | null>(null);
    const [isPaying, setIsPaying] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const [decodeError, setDecodeError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

     useEffect(() => {
        if (!isScanning) return;
        let stream: MediaStream | null = null;
        let animationFrameId: number;

        const scanQRCode = () => {
            if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        const data = code.data.toLowerCase().replace("lightning:", "");
                        setRequest(data);
                        toast({ title: "Code scanné avec succès" });
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
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                setHasCameraPermission(false);
            }
        };

        startScan();
        animationFrameId = requestAnimationFrame(scanQRCode);
        return () => {
            stream?.getTracks().forEach(track => track.stop());
            cancelAnimationFrame(animationFrameId);
        };
    }, [isScanning, toast]);


    const handleDecode = async () => {
        if (!request) return;
        setIsDecoding(true);
        setDecodeError(null);
        setDecoded(null);
        try {
            const res = await api.decodeLightningRequest({ request });
            setDecoded(res.data);
            setStep("confirm");
        } catch (err: any) {
            setDecodeError(err.message);
            toast({ variant: "destructive", title: "Erreur", description: err.message });
        } finally {
            setIsDecoding(false);
        }
    }

    const handlePay = async () => {
        if (!decoded) return;
        setIsPaying(true);
        try {
            await api.payLightningInvoice({
                request,
                amount_sats: decoded.amount_sats || undefined,
                type: decoded.type,
                internal: decoded.internal,
            });
            setStep("success");
        } catch (err: any) {
            toast({ variant: "destructive", title: "Échec du paiement", description: err.message });
        } finally {
            setIsPaying(false);
        }
    }

    if (step === 'success') {
        return (
            <Card className="p-8 text-center">
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
        )
    }

    if (step === 'confirm' && decoded) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Confirmer le Paiement</CardTitle>
                    <CardDescription>Vérifiez les détails avant de payer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                        {decoded.payee_pubkey && <p className="text-sm"><span className="font-semibold">À:</span> <span className="font-mono break-all text-xs">{decoded.payee_pubkey}</span></p>}
                        {decoded.memo && <p className="text-sm"><span className="font-semibold">Mémo:</span> {decoded.memo}</p>}
                        <p className="text-lg font-bold">{decoded.amount_sats ? `${decoded.amount_sats} sats` : 'Montant flexible'}</p>
                    </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => setStep('input')}>Retour</Button>
                    <Button onClick={handlePay} disabled={isPaying}>
                        {isPaying ? <Loader2 className="mr-2 size-4 animate-spin"/> : null}
                        Payer
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="text-primary"/>Vendre / Payer via Lightning</CardTitle>
                <CardDescription>Collez une facture ou scannez un QR code pour effectuer un paiement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea id="invoice" placeholder="lnbc... / user@domain.com / lnurl..." value={request} onChange={(e) => setRequest(e.target.value)} required rows={5} className="font-mono" />
                 <Dialog open={isScanning} onOpenChange={setIsScanning}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="w-full"><ScanLine className="mr-2 size-4" />Scanner un QR code</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader><DialogTitle>Scanner le QR</DialogTitle><DialogDescription>Pointez votre caméra vers un code QR Lightning.</DialogDescription></DialogHeader>
                        <div className="relative w-full aspect-square bg-muted rounded-md overflow-hidden">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute inset-0 border-4 border-primary rounded-lg" />
                        </div>
                        {hasCameraPermission === false && <Alert variant="destructive"><AlertTitle>Accès caméra requis</AlertTitle><AlertDescription>Veuillez autoriser l'accès à la caméra.</AlertDescription></Alert>}
                    </DialogContent>
                </Dialog>
                {decodeError && <p className="text-sm text-destructive">{decodeError}</p>}
            </CardContent>
            <CardFooter>
                <Button onClick={handleDecode} disabled={!request || isDecoding} className="w-full">
                    {isDecoding && <Loader2 className="mr-2 size-4 animate-spin"/>}
                    Suivant
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function SellPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [balance, setBalance] = useState<Balance | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);

    const [providers, setProviders] = useState<SellProvider[]>([]);
    
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FormData>({});
    
    const [feeEstimation, setFeeEstimation] = useState<FeeEstimation | null>(null);
    const [isEstimatingFee, setIsEstimatingFee] = useState(false);
    const [feeError, setFeeError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const currentBalance = balance ? parseFloat(balance.balance) : 0;
    
    const networkForm = useForm<z.infer<typeof networkSchema>>({
        resolver: zodResolver(networkSchema),
    });

    const amountForm = useForm<{ amount: number }>({
        resolver: zodResolver(amountSchema.extend({
            amount: z.coerce.number().positive().max(currentBalance, `Solde insuffisant. Disponible : ${currentBalance.toFixed(8)} BTC`)
        })),
        mode: "onChange",
    });

    const providerForm = useForm<{ providerId: string }>({
        resolver: zodResolver(providerSchema),
        mode: "onChange",
    });

    const paymentDetailsForm = useForm<z.infer<typeof paymentDetailsSchema>>({
        resolver: zodResolver(paymentDetailsSchema),
        mode: "onChange",
    });
    
    const fetchInitialData = useCallback(async () => {
        setIsLoadingData(true);
        setDataError(null);
        try {
            const [balanceRes, providersRes] = await Promise.all([
                api.getWalletBalance(),
                api.getSellProviders(),
            ]);
            setBalance(balanceRes.data);
            setProviders(providersRes.data.filter(p => p.can_sell));
        } catch (err: any) {
            const errorMsg = err.message || "Échec du chargement des données initiales.";
            setDataError(errorMsg);
            toast({ variant: "destructive", title: "Erreur", description: errorMsg });
        } finally {
            setIsLoadingData(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);
    
    const estimateFeeCallback = useCallback(async (amount: number) => {
        setIsEstimatingFee(true);
        setFeeError(null);
        try {
            const feeResponse = await api.estimateFee({ amount: String(amount) });
            setFeeEstimation(feeResponse.data);
        } catch (error: any) {
            setFeeError(error.message);
            setFeeEstimation(null);
        } finally {
            setIsEstimatingFee(false);
        }
    }, []);

    useEffect(() => {
        const newBalance = balance ? parseFloat(balance.balance) : 0;
        const schema = amountSchema.extend({
            amount: z.coerce.number().positive().max(newBalance, `Solde insuffisant. Disponible : ${newBalance.toFixed(8)} BTC`)
        });
        (amountForm.control as any)._resolver = zodResolver(schema);
        if (amountForm.formState.isDirty) {
            amountForm.trigger("amount");
        }
    }, [balance, amountForm]);

    const handleNext = async () => {
        let isStepValid = false;
        if (currentStep === 0) {
            isStepValid = await networkForm.trigger();
            if(isStepValid) {
                const newFormData = { ...formData, ...networkForm.getValues() };
                setFormData(newFormData);
                const network = newFormData.network;
                if (network === 'lightning') {
                    // Skip to Lightning component directly
                } else if (network === 'on-chain') {
                    setCurrentStep(1);
                }
            }
        }
        else if (currentStep === 1) {
            isStepValid = await amountForm.trigger();
            if (isStepValid) {
                const newFormData = { ...formData, ...amountForm.getValues() };
                setFormData(newFormData);
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            isStepValid = await providerForm.trigger();
            if (isStepValid) {
                const newFormData = { ...formData, ...providerForm.getValues() };
                setFormData(newFormData);
                setCurrentStep(3);
            }
        } else if (currentStep === 3) {
             isStepValid = await paymentDetailsForm.trigger();
            if (isStepValid) {
                const newFormData = { ...formData, paymentDetails: paymentDetailsForm.getValues() };
                setFormData(newFormData);
                if (newFormData.amount) {
                    estimateFeeCallback(newFormData.amount);
                }
                setCurrentStep(4);
            }
        }
    }


    const handleBack = () => {
        if (currentStep === 0 && formData.network) {
            setFormData({}); // Reset network choice
        } else {
            setCurrentStep(prev => Math.max(0, prev - 1));
        }
        if (currentStep <= 3) {
            setFeeEstimation(null);
            setFeeError(null);
        }
    };

    const handleSell = async () => {
        if (!formData.amount || !formData.providerId || !formData.paymentDetails || !feeEstimation) {
            toast({ variant: 'destructive', title: 'Données manquantes', description: 'Veuillez compléter toutes les étapes.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const finalAmountBtc = parseFloat(feeEstimation.sendable_btc);

            const orderPayload: SellOrderPayload = {
                direction: 'sell',
                provider_id: Number(formData.providerId),
                amount: formData.amount,
                btc_amount: finalAmountBtc,
                amount_currency: 'BTC',
                payout_data: formData.paymentDetails,
                total_amount: String(feeEstimation.sendable_bif),
            };
            
            const response = await api.createSellOrder(orderPayload);
            toast({ title: 'Commande de vente créée', description: `Votre commande #${response.data.id} est en cours de traitement.` });
            router.push(`/orders/${response.data.id}`);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Échec de la vente', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const selectedProvider = useMemo(() => {
        return providers.find(p => String(p.id) === formData.providerId);
    }, [providers, formData.providerId]);

    const renderNetworkStep = () => (
         <Card>
            <CardHeader>
                <CardTitle>Étape 1: Choisissez le Réseau</CardTitle>
                <CardDescription>Indiquez si vous souhaitez vendre des fonds depuis votre solde On-Chain ou Lightning.</CardDescription>
            </CardHeader>
            <Form {...networkForm}>
                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                    <CardContent>
                         <FormField
                            control={networkForm.control}
                            name="network"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="on-chain" id="on-chain" className="peer sr-only" />
                                                </FormControl>
                                                <Label htmlFor="on-chain" className="cursor-pointer hover:border-primary transition-colors p-6 flex flex-col items-center justify-center text-center rounded-lg border-2 border-muted bg-popover peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                                    <Bitcoin className="size-10 text-primary mb-3"/>
                                                    <h3 className="font-semibold text-lg">On-Chain</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">Vendre depuis votre solde principal. Idéal pour des montants plus importants.</p>
                                                </Label>
                                            </FormItem>
                                             <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="lightning" id="lightning" className="peer sr-only" />
                                                </FormControl>
                                                <Label htmlFor="lightning" className="cursor-pointer hover:border-primary transition-colors p-6 flex flex-col items-center justify-center text-center rounded-lg border-2 border-muted bg-popover peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                                    <Zap className="size-10 text-primary mb-3"/>
                                                    <h3 className="font-semibold text-lg">Lightning</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">Payer une facture ou un service avec votre solde Lightning.</p>
                                                </Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage className="pt-2" />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg">Suivant</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );

    const renderAmountStep = () => (
         <Card>
            <CardHeader>
                <CardTitle>Étape 2: Entrez le Montant</CardTitle>
                <CardDescription>Spécifiez la quantité de Bitcoin que vous souhaitez vendre.</CardDescription>
            </CardHeader>
            <Form {...amountForm}>
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <CardContent className="space-y-6">
                     <div className="p-4 rounded-lg bg-secondary border">
                        <p className="text-sm text-muted-foreground">Votre solde disponible</p>
                        {isLoadingData ? 
                            <Skeleton className="h-8 w-48 mt-1" /> :
                            <p className="text-2xl font-bold font-mono">{currentBalance.toFixed(8)} BTC</p>
                        }
                    </div>
                    <FormField
                        control={amountForm.control}
                        name="amount"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Montant en BTC</FormLabel>
                            <div className="relative">
                                <FormControl><Input type="number" step="0.00000001" placeholder="0.00" {...field} value={field.value ?? ''} className="pl-8 text-lg h-12"/></FormControl>
                                <Bitcoin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => amountForm.setValue("amount", parseFloat((currentBalance * 0.25).toFixed(8)), { shouldValidate: true })}>25%</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => amountForm.setValue("amount", parseFloat((currentBalance * 0.50).toFixed(8)), { shouldValidate: true })}>50%</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => amountForm.setValue("amount", parseFloat((currentBalance * 0.75).toFixed(8)), { shouldValidate: true })}>75%</Button>
                                <Button type="button" variant="destructive" size="sm" onClick={() => amountForm.setValue("amount", currentBalance, { shouldValidate: true })}>Max</Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" size="lg">Suivant</Button>
                </CardFooter>
            </form>
            </Form>
        </Card>
    );

     const renderProviderStep = () => (
         <Card>
            <CardHeader>
                <CardTitle>Étape 3: Choisissez un Fournisseur</CardTitle>
                <CardDescription>Sélectionnez un fournisseur pour traiter votre transaction de vente.</CardDescription>
            </CardHeader>
             <Form {...providerForm}>
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <CardContent className="space-y-6">
                    {dataError && <Alert variant="destructive"><AlertTitle>Erreur</AlertTitle><AlertDescription>{dataError}</AlertDescription></Alert>}
                     {!dataError && providers.length === 0 && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Aucun Fournisseur Disponible</AlertTitle>
                            <AlertDescription>Actuellement, aucun fournisseur n'est disponible pour traiter les ordres de vente. Veuillez réessayer plus tard.</AlertDescription>
                        </Alert>
                    )}
                    <FormField
                        control={providerForm.control}
                        name="providerId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fournisseurs disponibles</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                        {providers.map(provider => (
                                            <FormItem key={provider.id}>
                                                <FormControl>
                                                     <RadioGroupItem value={String(provider.id)} id={`provider-${provider.id}`} className="peer sr-only" />
                                                </FormControl>
                                                <Label htmlFor={`provider-${provider.id}`} className="block rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    <div className="flex items-start gap-4">
                                                        {provider.image ? <Image src={provider.image} alt={`${provider.name} logo`} width={40} height={40} className="rounded-lg border" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-secondary"><Landmark className="size-5 text-muted-foreground" /></div>}
                                                        <div>
                                                            <p className="font-semibold">{provider.name}</p>
                                                            <p className="text-sm text-muted-foreground">{provider.description}</p>
                                                        </div>
                                                    </div>
                                                </Label>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" size="lg" disabled={providers.length === 0}>Suivant</Button>
                </CardFooter>
            </form>
            </Form>
        </Card>
    );

    const renderPaymentDetailsStep = () => (
         <Card>
            <CardHeader>
                <CardTitle>Étape 4: Entrez les Détails de Paiement</CardTitle>
                <CardDescription>Fournissez vos informations de compte pour recevoir les fonds. C'est là que votre argent sera envoyé, alors assurez-vous de l'exactitude.</CardDescription>
            </CardHeader>
             <Form {...paymentDetailsForm}>
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <CardContent className="space-y-4">
                     <FormField
                        control={paymentDetailsForm.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom Complet</FormLabel>
                                <FormControl>
                                    <Input placeholder="ex: Alice Dubois" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={paymentDetailsForm.control}
                        name="phone_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Numéro de téléphone</FormLabel>
                                <FormControl>
                                    <Input placeholder="ex: +25779988777" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={paymentDetailsForm.control}
                        name="account_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Numéro de Compte</FormLabel>
                                <FormControl>
                                    <Input placeholder="ex: 987654321" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={paymentDetailsForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail (Optionnel)</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="ex: alice@example.com" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" size="lg">Suivant</Button>
                </CardFooter>
            </form>
            </Form>
        </Card>
    );

    const renderConfirmationStep = () => {
        if (isEstimatingFee) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Étape 5: Confirmer & Vendre</CardTitle>
                        <CardDescription>Passez en revue les détails de votre transaction avant de confirmer la vente.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-48">
                        <Loader2 className="mr-2 size-6 animate-spin" />
                        <p>Estimation des frais...</p>
                    </CardContent>
                </Card>
            );
        }

        if (feeError) {
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle>Étape 5: Confirmer & Vendre</CardTitle>
                        <CardDescription>Passez en revue les détails de votre transaction avant de confirmer la vente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Échec de l'estimation des frais</AlertTitle>
                            <AlertDescription>{feeError}</AlertDescription>
                        </Alert>
                    </CardContent>
                     <CardFooter>
                         <Button variant="outline" size="lg" onClick={handleBack} className="w-full">
                            Retour
                        </Button>
                    </CardFooter>
                </Card>
            );
        }
        
        if (!formData.amount || !selectedProvider || !feeEstimation || !formData.paymentDetails) {
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle>Étape 5: Confirmer & Vendre</CardTitle>
                        <CardDescription>Veuillez compléter toutes les étapes précédentes pour voir le résumé de votre transaction.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground text-center py-8">En attente des détails de la transaction...</p>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-4">
                         <Button variant="outline" size="lg" onClick={handleBack} disabled={isSubmitting}>Retour</Button>
                        <Button size="lg" disabled={true}>
                            Vendre des Bitcoins
                        </Button>
                    </CardFooter>
                </Card>
            );
        }

        const amountToSellBtc = parseFloat(String(formData.amount));
        const networkFeeBtc = parseFloat(feeEstimation.network_fee_btc);
        const finalAmountBtc = parseFloat(feeEstimation.sendable_btc);
        const amountToReceiveUsd = feeEstimation.sendable_usd;
        const amountToReceiveBif = feeEstimation.sendable_bif;


        return (
            <Card>
                <CardHeader>
                    <CardTitle>Étape 5: Confirmer & Vendre</CardTitle>
                    <CardDescription>Passez en revue les détails de votre transaction avant de confirmer la vente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-secondary border space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">À vendre</span>
                            <span className="font-mono font-bold text-base">{amountToSellBtc.toFixed(8)} BTC</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Frais de réseau</span>
                            <span className="font-mono">-{networkFeeBtc.toFixed(8)} BTC</span>
                        </div>
                        <div className="border-t border-dashed" />
                        <div className="flex justify-between items-center font-semibold">
                            <span className="text-foreground">Montant de la vente (BTC)</span>
                            <span className="font-mono text-base">{finalAmountBtc.toFixed(8)} BTC</span>
                        </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border space-y-3">
                         <p className="font-semibold text-center text-sm text-muted-foreground mb-2">Vous recevrez (Environ)</p>
                        <div className="flex justify-between items-baseline">
                            <span className="text-lg text-muted-foreground">USD</span>
                            <span className="text-2xl font-bold font-mono">{getFiat(amountToReceiveUsd, 'USD')}</span>
                        </div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-lg text-muted-foreground">BIF</span>
                            <span className="text-2xl font-bold font-mono">{getFiat(amountToReceiveBif, 'BIF')}</span>
                        </div>
                    </div>

                     <Card className="bg-secondary/30">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Détails de Paiement</CardTitle>
                            <CardDescription>Les fonds seront envoyés via {selectedProvider?.name} aux détails suivants:</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <UserIcon className="size-4 text-muted-foreground" />
                                <span className="font-semibold">{formData.paymentDetails?.full_name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="size-4 text-muted-foreground" />
                                <span className="font-semibold">{formData.paymentDetails?.phone_number}</span>
                            </div>
                            {formData.paymentDetails?.account_number && (
                                 <div className="flex items-center gap-3">
                                    <Landmark className="size-4 text-muted-foreground" />
                                    <span className="font-semibold">{formData.paymentDetails.account_number}</span>
                                </div>
                            )}
                            {formData.paymentDetails?.email && (
                                 <div className="flex items-center gap-3">
                                    <Mail className="size-4 text-muted-foreground" />
                                    <span className="font-semibold">{formData.paymentDetails.email}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 </CardContent>
                <CardFooter className="grid grid-cols-2 gap-4">
                    <Button variant="outline" size="lg" onClick={handleBack} disabled={isSubmitting}>Annuler</Button>
                    <Button size="lg" disabled={isEstimatingFee || !feeEstimation || isSubmitting} onClick={handleSell}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isSubmitting ? "Vente en cours..." : "Vendre des Bitcoins"}
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    if (isLoadingData) {
        return (
            <div className="mx-auto max-w-2xl space-y-6">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-72" />
                <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
            </div>
        )
    }
    
    if (dataError && !formData.network) {
      return (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Vendre des Bitcoins</h1>
            <p className="text-muted-foreground">Suivez les étapes pour vendre vos Bitcoins en toute sécurité.</p>
          </div>
           <Card className="flex h-48 items-center justify-center">
            <div className="text-center text-destructive">
              <AlertCircle className="mx-auto h-8 w-8" />
              <p className="mt-2 font-semibold">Erreur de chargement des données</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">{dataError}</p>
              <Button onClick={fetchInitialData} variant="secondary" className="mt-4">
                {isLoadingData && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Réessayer
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    const onChainSteps = [
        { title: "Montant" },
        { title: "Fournisseur" },
        { title: "Paiement" },
        { title: "Confirmer" }
    ];

    const showBackButton = currentStep > 0 || formData.network;

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-2">
                {showBackButton && (
                    <Button variant="ghost" onClick={handleBack} className="-ml-4">
                        <ArrowLeft className="mr-2 size-4" /> Retour
                    </Button>
                )}
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Vendre des Bitcoins</h1>
                <p className="text-muted-foreground">Suivez les étapes pour vendre vos Bitcoins en toute sécurité.</p>
            </div>
            
            {formData.network === 'on-chain' && (
                <div className="flex w-full items-center justify-between rounded-lg border bg-card p-2 text-xs sm:text-sm">
                    {onChainSteps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-2">
                                <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${currentStep > index + 1 ? 'bg-primary text-primary-foreground' : currentStep === index + 1 ? 'border-2 border-primary text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {currentStep > index + 1 ? <Check className="size-4" /> : index + 1}
                                </div>
                                <span className={`hidden sm:block ${currentStep >= index + 1 ? 'font-semibold' : 'text-muted-foreground'}`}>{step.title}</span>
                            </div>
                            {index < onChainSteps.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
                        </React.Fragment>
                    ))}
                </div>
            )}
            

            {!formData.network && renderNetworkStep()}
            {formData.network === "on-chain" && (
                <>
                    {currentStep === 1 && renderAmountStep()}
                    {currentStep === 2 && renderProviderStep()}
                    {currentStep === 3 && renderPaymentDetailsStep()}
                    {currentStep === 4 && renderConfirmationStep()}
                </>
            )}
             {formData.network === "lightning" && <LightningSell />}
        </div>
    );
}

