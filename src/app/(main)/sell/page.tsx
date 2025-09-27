
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { Balance, SellProvider, FeeEstimation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { AlertCircle, ArrowRight, Bitcoin, Landmark, Loader2 } from "lucide-react";
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
import { useSettings } from "@/context/settings-context";
import { cn } from "@/lib/utils";
import { BalanceDisplay } from "@/components/balance-display";

const sellFormSchema = (balance: number) => z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount." })
    .positive({ message: "Amount must be positive." })
    .max(balance, { message: `Insufficient balance. Available: ${balance.toFixed(8)} BTC` }),
  providerId: z.string().min(1, "Please select a provider."),
});

type SellFormValues = z.infer<ReturnType<typeof sellFormSchema>>;


export default function SellPage() {
  const { toast } = useToast();
  const { settings } = useSettings();

  const [balance, setBalance] = useState<Balance | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);

  const [providers, setProviders] = useState<SellProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [providersError, setProvidersError] = useState<string | null>(null);
  
  const currentBalance = balance ? parseFloat(balance.balance) : 0;
  
  const form = useForm<SellFormValues>({
    resolver: zodResolver(sellFormSchema(currentBalance)),
    mode: "onChange",
  });

  const watchedAmount = form.watch("amount");
  const watchedProviderId = form.watch("providerId");

  useEffect(() => {
    async function fetchBalance() {
      setIsBalanceLoading(true);
      try {
        const response = await api.getWalletBalance();
        setBalance(response.data);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch wallet balance." });
      } finally {
        setIsBalanceLoading(false);
      }
    }
    
    async function fetchProviders() {
      setLoadingProviders(true);
      setProvidersError(null);
      try {
        const response = await api.getSellProviders();
        setProviders(response.data.filter(p => p.can_sell));
      } catch (err: any) {
        setProvidersError(err.message || "Failed to load sell providers.");
      } finally {
        setLoadingProviders(false);
      }
    }

    fetchBalance();
    fetchProviders();
  }, [toast]);
  
   useEffect(() => {
    const newBalance = balance ? parseFloat(balance.balance) : 0;
    (form.control as any)._resolver = zodResolver(sellFormSchema(newBalance));
     if (form.formState.isDirty) {
      form.trigger("amount");
    }
  }, [balance, form]);

  const handleSetAmount = (percentage: number) => {
    const newAmount = currentBalance * percentage;
    form.setValue("amount", parseFloat(newAmount.toFixed(8)), { shouldValidate: true, shouldDirty: true });
  };
  
  const onSubmit = async (data: SellFormValues) => {
    //
  }

  const selectedProvider = providers.find(p => String(p.id) === watchedProviderId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Sell Bitcoin</h1>
        <p className="text-muted-foreground">
          Choose an amount and a provider to receive payment.
        </p>
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="text-lg">Your Balance</CardTitle>
            <CardDescription>Your current available wallet balance.</CardDescription>
        </CardHeader>
        <CardContent>
            {isBalanceLoading ? (
                 <Skeleton className="h-10 w-48" />
            ) : (
                <div className="text-3xl font-bold font-mono">
                    {currentBalance.toFixed(8)} BTC
                </div>
            )}
        </CardContent>
      </Card>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Amount to Sell</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Amount in BTC</FormLabel>
                                </div>
                                <div className="relative">
                                    <FormControl><Input type="number" step="0.00000001" placeholder="0.00" {...field} value={field.value ?? ""} className="pl-8 text-lg h-12"/></FormControl>
                                    <Bitcoin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => handleSetAmount(0.25)}>25%</Button>
                                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => handleSetAmount(0.50)}>50%</Button>
                                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => handleSetAmount(0.75)}>75%</Button>
                                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => handleSetAmount(1.00)}>100%</Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                 </Card>
                 
                 <Card>
                    <CardHeader>
                        <CardTitle>Choose a Provider</CardTitle>
                        <CardDescription>Select where you want to receive your payment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingProviders && <Skeleton className="h-24 w-full" />}
                        {providersError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{providersError}</AlertDescription></Alert>}
                        
                        {!loadingProviders && !providersError && (
                             <FormField
                                control={form.control}
                                name="providerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="space-y-4"
                                            >
                                                {providers.map(provider => (
                                                    <FormItem key={provider.id} className="relative">
                                                        <FormControl>
                                                             <RadioGroupItem value={String(provider.id)} id={`provider-${provider.id}`} className="peer sr-only" />
                                                        </FormControl>
                                                        <Label htmlFor={`provider-${provider.id}`} className="block rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                            <div className="flex items-start gap-4">
                                                                {provider.logo_url ? (
                                                                    <Image src={provider.logo_url} alt={`${provider.name} logo`} width={40} height={40} className="rounded-lg border" />
                                                                ) : (
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-secondary"><Landmark className="size-5 text-muted-foreground" /></div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <p className="font-semibold">{provider.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                                        {provider.currencies.map(c => <Badge key={c} variant="secondary">{c.toUpperCase()}</Badge>)}
                                                                    </div>
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
                        )}
                        
                    </CardContent>
                 </Card>
            </div>
            <div className="space-y-6 lg:sticky lg:top-24">
                 <Card>
                    <CardHeader>
                        <CardTitle>You Will Receive</CardTitle>
                        <CardDescription>This is an estimate of what you'll get after fees.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">BTC to Sell</span><span className="font-mono">{watchedAmount || '0.00'} BTC</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Network Fee</span><span className="font-mono">... BTC</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Provider Fee</span><span className="font-mono">... BTC</span></div>
                         </div>
                         <div className="border-t border-dashed"></div>
                         <div className="space-y-2">
                             <div className="flex justify-between font-bold text-base"><span >Net Amount (USD)</span><span className="font-mono">$0.00</span></div>
                             <div className="flex justify-between font-bold text-base"><span >Net Amount (BIF)</span><span className="font-mono">0 BIF</span></div>
                         </div>
                         {selectedProvider && (
                            <Card className="bg-secondary/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2"><Landmark className="size-4" /> Payment via {selectedProvider.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{selectedProvider.payment_info.instructions}</p>
                                </CardContent>
                            </Card>
                         )}
                    </CardContent>
                    <CardFooter>
                       <Button type="submit" className="w-full" size="lg">
                            Sell Bitcoin
                        </Button>
                    </CardFooter>
                 </Card>
            </div>
        </form>
      </Form>
    </div>
  );
}

    