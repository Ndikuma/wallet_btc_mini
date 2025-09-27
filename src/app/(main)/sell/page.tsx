
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { Balance, SellProvider, FeeEstimation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bitcoin, Landmark, Loader2, Banknote } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";


const amountSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount." })
    .positive({ message: "Amount must be positive." }),
});

const providerSchema = z.object({
    providerId: z.string({ required_error: "Please select a provider." }),
    paymentDetails: z.string().min(3, "Please enter valid payment details."),
});

type FormData = {
    amount?: number;
    providerId?: string;
    paymentDetails?: string;
};


export default function SellPage() {
    const { toast } = useToast();
    const [balance, setBalance] = useState<Balance | null>(null);
    const [isBalanceLoading, setIsBalanceLoading] = useState(true);

    const [providers, setProviders] = useState<SellProvider[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(true);
    const [providersError, setProvidersError] = useState<string | null>(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({});
    
    const currentBalance = balance ? parseFloat(balance.balance) : 0;

    const amountForm = useForm<{ amount: number }>({
        resolver: zodResolver(amountSchema.extend({
            amount: z.coerce.number().positive().max(currentBalance, `Insufficient balance. Available: ${currentBalance.toFixed(8)} BTC`)
        })),
        mode: "onChange",
    });

    const providerForm = useForm<{ providerId: string, paymentDetails: string }>({
        resolver: zodResolver(providerSchema),
        mode: "onChange",
    });

    useEffect(() => {
        async function fetchInitialData() {
            setIsBalanceLoading(true);
            setLoadingProviders(true);
            try {
                const [balanceRes, providersRes] = await Promise.all([
                    api.getWalletBalance(),
                    api.getSellProviders(),
                ]);
                setBalance(balanceRes.data);
                setProviders(providersRes.data.filter(p => p.can_sell));
            } catch (err: any) {
                toast({ variant: "destructive", title: "Error", description: err.message || "Could not load required data." });
                setProvidersError(err.message || "Failed to load providers.");
            } finally {
                setIsBalanceLoading(false);
                setLoadingProviders(false);
            }
        }
        fetchInitialData();
    }, [toast]);
    
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

    const handleNextStep1 = (data: { amount: number }) => {
        setFormData(prev => ({ ...prev, ...data }));
        setCurrentStep(2);
    };

    const handleNextStep2 = (data: { providerId: string, paymentDetails: string }) => {
        setFormData(prev => ({ ...prev, ...data }));
        setCurrentStep(3);
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(1, prev - 1));
    };
    
    const selectedProvider = useMemo(() => {
        return providers.find(p => String(p.id) === formData.providerId);
    }, [providers, formData.providerId]);


    if (isBalanceLoading || loadingProviders) {
        return (
            <div className="mx-auto max-w-2xl space-y-6">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-72" />
                <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Sell Bitcoin</h1>
                <p className="text-muted-foreground">Follow the steps to sell your Bitcoin securely.</p>
            </div>
            
            <div className="space-y-4">
                <Progress value={(currentStep / 3) * 100} className="w-full h-2" />
                <p className="text-sm text-muted-foreground text-center">Step {currentStep} of 3</p>
            </div>
            
            {currentStep > 1 && (
                <Button variant="ghost" onClick={handleBack} className="mb-4">
                    <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
            )}

            {currentStep === 1 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Enter Amount</CardTitle>
                        <CardDescription>Specify how much Bitcoin you want to sell.</CardDescription>
                    </CardHeader>
                    <Form {...amountForm}>
                    <form onSubmit={amountForm.handleSubmit(handleNextStep1)}>
                        <CardContent className="space-y-6">
                             <div className="p-4 rounded-lg bg-secondary border">
                                <p className="text-sm text-muted-foreground">Your available balance</p>
                                <p className="text-2xl font-bold font-mono">{currentBalance.toFixed(8)} BTC</p>
                            </div>
                            <FormField
                                control={amountForm.control}
                                name="amount"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount in BTC</FormLabel>
                                    <div className="relative">
                                        <FormControl><Input type="number" step="0.00000001" placeholder="0.00" {...field} value={field.value ?? ""} className="pl-8 text-lg h-12"/></FormControl>
                                        <Bitcoin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => amountForm.setValue("amount", parseFloat((currentBalance * 0.25).toFixed(8)), { shouldValidate: true })}>25%</Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => amountForm.setValue("amount", parseFloat((currentBalance * 0.50).toFixed(8)), { shouldValidate: true })}>50%</Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => amountForm.setValue("amount", parseFloat((currentBalance * 0.75).toFixed(8)), { shouldValidate: true })}>75%</Button>
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
            )}

            {currentStep === 2 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Select Provider</CardTitle>
                        <CardDescription>Choose a provider and enter your payment details.</CardDescription>
                    </CardHeader>
                     <Form {...providerForm}>
                    <form onSubmit={providerForm.handleSubmit(handleNextStep2)}>
                        <CardContent className="space-y-6">
                           <div className="p-4 rounded-lg bg-secondary border">
                                <p className="text-sm text-muted-foreground">Amount to sell</p>
                                <p className="text-xl font-bold font-mono">{formData.amount?.toFixed(8)} BTC</p>
                           </div>
                           
                            {providersError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{providersError}</AlertDescription></Alert>}
                            <FormField
                                control={providerForm.control}
                                name="providerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Provider</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                                {providers.map(provider => (
                                                    <FormItem key={provider.id}>
                                                        <FormControl>
                                                             <RadioGroupItem value={String(provider.id)} id={`provider-${provider.id}`} className="peer sr-only" />
                                                        </FormControl>
                                                        <Label htmlFor={`provider-${provider.id}`} className="block rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                            <div className="flex items-start gap-4">
                                                                {provider.logo_url ? <Image src={provider.logo_url} alt={`${provider.name} logo`} width={40} height={40} className="rounded-lg border" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-secondary"><Landmark className="size-5 text-muted-foreground" /></div>}
                                                                <div>
                                                                    <p className="font-semibold">{provider.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                                                                    <div className="flex flex-wrap gap-2 mt-2">{provider.currencies.map(c => <Badge key={c} variant="secondary">{c.toUpperCase()}</Badge>)}</div>
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
                             <FormField
                                control={providerForm.control}
                                name="paymentDetails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Payment Details</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Account number, Phone number, Wallet address" {...field} />
                                        </FormControl>
                                        <FormDescription>This is where your money will be sent. Double-check for accuracy.</FormDescription>
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
            )}

            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 3: Confirm & Sell</CardTitle>
                        <CardDescription>Review your transaction details before confirming the sale.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-secondary border space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Selling</span>
                                <span className="font-mono font-bold text-base">{formData.amount?.toFixed(8)} BTC</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Network Fee</span>
                                <span className="font-mono">... BTC</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Provider Fee</span>
                                <span className="font-mono">... BTC</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary border space-y-2">
                             <div className="flex justify-between font-bold text-base">
                                <span >You Will Receive (Estimate)</span>
                                <span className="font-mono">$0.00</span>
                             </div>
                             <div className="text-right text-muted-foreground font-mono text-sm">0 BIF</div>
                        </div>

                         <Card className="bg-secondary/30">
                            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                                {selectedProvider?.logo_url ? <Image src={selectedProvider.logo_url} alt="" width={32} height={32} className="rounded-lg border" /> : <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-secondary"><Landmark className="size-4 text-muted-foreground" /></div>}
                                <CardTitle className="text-base">Receiving via {selectedProvider?.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-mono font-semibold break-all">{formData.paymentDetails}</p>
                                <p className="text-sm text-muted-foreground mt-1">{selectedProvider?.payment_info.instructions}</p>
                            </CardContent>
                        </Card>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-4">
                        <Button variant="outline" size="lg" onClick={handleBack}>Cancel</Button>
                        <Button size="lg">Sell Bitcoin</Button>
                    </CardFooter>
                </Card>
            )}

        </div>
    );
    