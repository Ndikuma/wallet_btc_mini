
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { Balance, SellProvider, FeeEstimation, SellOrderPayload, PayoutData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bitcoin, Landmark, Loader2, Banknote, Info, User as UserIcon, Phone, Mail, AlertCircle, Check } from "lucide-react";
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

const amountSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount." })
    .positive({ message: "Amount must be positive." }),
});

const providerSchema = z.object({
    providerId: z.string({ required_error: "Please select a provider." }),
});

const paymentDetailsSchema = z.object({
    full_name: z.string().min(1, "Full name is required."),
    phone_number: z.string().min(1, "Phone number is required."),
    account_number: z.string().min(1, "Account number is required."),
    email: z.string().email("Please enter a valid email.").optional(),
})

type FormData = {
    amount?: number;
    providerId?: string;
    paymentDetails?: PayoutData;
};

export default function SellPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [balance, setBalance] = useState<Balance | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);

    const [providers, setProviders] = useState<SellProvider[]>([]);
    
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({});
    
    const [feeEstimation, setFeeEstimation] = useState<FeeEstimation | null>(null);
    const [isEstimatingFee, setIsEstimatingFee] = useState(false);
    const [feeError, setFeeError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const currentBalance = balance ? parseFloat(balance.balance) : 0;

    const amountForm = useForm<{ amount: number }>({
        resolver: zodResolver(amountSchema.extend({
            amount: z.coerce.number().positive().max(currentBalance, `Insufficient balance. Available: ${currentBalance.toFixed(8)} BTC`)
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
            const errorMsg = err.message || "Failed to load initial data.";
            setDataError(errorMsg);
            toast({ variant: "destructive", title: "Error", description: errorMsg });
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
            amount: z.coerce.number().positive().max(newBalance, `Insufficient balance. Available: ${newBalance.toFixed(8)} BTC`)
        });
        (amountForm.control as any)._resolver = zodResolver(schema);
        if (amountForm.formState.isDirty) {
            amountForm.trigger("amount");
        }
    }, [balance, amountForm]);

    const handleNext = async () => {
        let isStepValid = false;
        if (currentStep === 1) {
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
        setCurrentStep(prev => Math.max(1, prev - 1));
        if (currentStep <= 3) {
            setFeeEstimation(null);
            setFeeError(null);
        }
    };

    const handleSell = async () => {
        if (!formData.amount || !formData.providerId || !formData.paymentDetails || !feeEstimation) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please complete all steps.' });
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
            toast({ title: 'Sell Order Created', description: `Your order #${response.data.id} is being processed.` });
            router.push(`/orders/${response.data.id}`);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Sell Failed', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const selectedProvider = useMemo(() => {
        return providers.find(p => String(p.id) === formData.providerId);
    }, [providers, formData.providerId]);


    const renderAmountStep = () => (
         <Card>
            <CardHeader>
                <CardTitle>Step 1: Enter Amount</CardTitle>
                <CardDescription>Specify how much Bitcoin you want to sell.</CardDescription>
            </CardHeader>
            <Form {...amountForm}>
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <CardContent className="space-y-6">
                     <div className="p-4 rounded-lg bg-secondary border">
                        <p className="text-sm text-muted-foreground">Your available balance</p>
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
                            <FormLabel>Amount in BTC</FormLabel>
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
                    <Button type="submit" className="w-full" size="lg">Next</Button>
                </CardFooter>
            </form>
            </Form>
        </Card>
    );

     const renderProviderStep = () => (
         <Card>
            <CardHeader>
                <CardTitle>Step 2: Select Provider</CardTitle>
                <CardDescription>Choose a provider to handle your sell transaction.</CardDescription>
            </CardHeader>
             <Form {...providerForm}>
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <CardContent className="space-y-6">
                    {dataError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{dataError}</AlertDescription></Alert>}
                     {!dataError && providers.length === 0 && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>No Providers Available</AlertTitle>
                            <AlertDescription>There are currently no providers available to process sell orders. Please check back later.</AlertDescription>
                        </Alert>
                    )}
                    <FormField
                        control={providerForm.control}
                        name="providerId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Available Providers</FormLabel>
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
                    <Button type="submit" className="w-full" size="lg" disabled={providers.length === 0}>Next</Button>
                </CardFooter>
            </form>
            </Form>
        </Card>
    );

    const renderPaymentDetailsStep = () => (
         <Card>
            <CardHeader>
                <CardTitle>Step 3: Enter Payout Details</CardTitle>
                <CardDescription>Provide your account information to receive the funds. This is where your money will be sent, so please double-check for accuracy.</CardDescription>
            </CardHeader>
             <Form {...paymentDetailsForm}>
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <CardContent className="space-y-4">
                     <FormField
                        control={paymentDetailsForm.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Alice Ndayizeye" {...field} value={field.value ?? ''} />
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
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., +25779988777" {...field} value={field.value ?? ''} />
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
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 987654321" {...field} value={field.value ?? ''} />
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
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="e.g., alice@example.com" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" size="lg">Next</Button>
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
                        <CardTitle>Step 4: Confirm & Sell</CardTitle>
                        <CardDescription>Review your transaction details before confirming the sale.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-48">
                        <Loader2 className="mr-2 size-6 animate-spin" />
                        <p>Estimating network fee...</p>
                    </CardContent>
                </Card>
            );
        }

        if (feeError) {
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 4: Confirm & Sell</CardTitle>
                        <CardDescription>Review your transaction details before confirming the sale.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Fee Estimation Failed</AlertTitle>
                            <AlertDescription>{feeError}</AlertDescription>
                        </Alert>
                    </CardContent>
                     <CardFooter>
                         <Button variant="outline" size="lg" onClick={handleBack} className="w-full">
                            Back
                        </Button>
                    </CardFooter>
                </Card>
            );
        }
        
        if (!formData.amount || !selectedProvider || !feeEstimation || !formData.paymentDetails) {
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 4: Confirm & Sell</CardTitle>
                        <CardDescription>Please complete all previous steps to see your transaction summary.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground text-center py-8">Waiting for transaction details...</p>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-4">
                         <Button variant="outline" size="lg" onClick={handleBack} disabled={isSubmitting}>Back</Button>
                        <Button size="lg" disabled={true}>
                            Sell Bitcoin
                        </Button>
                    </CardFooter>
                </Card>
            );
        }

        const amountToSellBtc = formData.amount;
        const networkFeeBtc = parseFloat(feeEstimation.network_fee_btc);
        const finalAmountBtc = parseFloat(feeEstimation.sendable_btc);
        const amountToReceiveUsd = feeEstimation.sendable_usd;
        const amountToReceiveBif = feeEstimation.sendable_bif;


        return (
            <Card>
                <CardHeader>
                    <CardTitle>Step 4: Confirm & Sell</CardTitle>
                    <CardDescription>Review your transaction details before confirming the sale.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-secondary border space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Selling</span>
                            <span className="font-mono font-bold text-base">{amountToSellBtc.toFixed(8)} BTC</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Network Fee</span>
                            <span className="font-mono">-{networkFeeBtc.toFixed(8)} BTC</span>
                        </div>
                        <div className="border-t border-dashed" />
                        <div className="flex justify-between items-center font-semibold">
                            <span className="text-foreground">Amount to Sell (BTC)</span>
                            <span className="font-mono text-base">{finalAmountBtc.toFixed(8)} BTC</span>
                        </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border space-y-3">
                         <p className="font-semibold text-center text-sm text-muted-foreground mb-2">You Will Receive (Approx.)</p>
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
                            <CardTitle className="text-base">Payout Details</CardTitle>
                            <CardDescription>Funds will be sent via {selectedProvider?.name} to the following:</CardDescription>
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
                    <Button variant="outline" size="lg" onClick={handleBack} disabled={isSubmitting}>Cancel</Button>
                    <Button size="lg" disabled={isEstimatingFee || !feeEstimation || isSubmitting} onClick={handleSell}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isSubmitting ? "Processing..." : "Sell Bitcoin"}
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
    
    if (dataError) {
      return (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Sell Bitcoin</h1>
            <p className="text-muted-foreground">Follow the steps to sell your Bitcoin securely.</p>
          </div>
           <Card className="flex h-48 items-center justify-center">
            <div className="text-center text-destructive">
              <AlertCircle className="mx-auto h-8 w-8" />
              <p className="mt-2 font-semibold">Error Loading Data</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">{dataError}</p>
              <Button onClick={fetchInitialData} variant="secondary" className="mt-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" hidden={!isLoadingData}/>
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    const steps = [
        { title: "Amount", isComplete: currentStep > 1 },
        { title: "Provider", isComplete: currentStep > 2 },
        { title: "Payout", isComplete: currentStep > 3 },
        { title: "Confirm", isComplete: currentStep > 4 }
    ];

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Sell Bitcoin</h1>
                <p className="text-muted-foreground">Follow the steps to sell your Bitcoin securely.</p>
            </div>
            
             <div className="flex w-full items-center justify-between rounded-lg border bg-card p-2 text-xs sm:text-sm">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-2">
                            <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${currentStep > index + 1 ? 'bg-primary text-primary-foreground' : currentStep === index + 1 ? 'border-2 border-primary text-primary' : 'bg-muted text-muted-foreground'}`}>
                                {currentStep > index + 1 ? <Check className="size-4" /> : index + 1}
                            </div>
                            <span className={`hidden sm:block ${currentStep >= index + 1 ? 'font-semibold' : 'text-muted-foreground'}`}>{step.title}</span>
                        </div>
                        {index < steps.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
                    </React.Fragment>
                ))}
            </div>
            
            {currentStep > 1 && (
                <Button variant="ghost" onClick={handleBack} className="-mb-2">
                    <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
            )}

            {currentStep === 1 && renderAmountStep()}
            {currentStep === 2 && renderProviderStep()}
            {currentStep === 3 && renderPaymentDetailsStep()}
            {currentStep === 4 && renderConfirmationStep()}
        </div>
    );
}
