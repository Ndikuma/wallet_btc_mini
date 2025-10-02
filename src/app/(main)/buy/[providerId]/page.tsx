
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { BuyProvider, BuyFeeCalculation, Order, BuyOrderPayload } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { ArrowLeft, Banknote, Landmark, Loader2, Receipt, ShoppingCart, Bitcoin, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/copy-button";


const buySchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Ndokera ushire umubare wemewe." })
    .min(1, { message: "Umubare ugomba kuba byibura 1." }),
  currency: z.string().min(1, "Ndokera utore ifaranga."),
});

type BuyFormValues = z.infer<typeof buySchema>;

export default function BuyWithProviderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const providerId = Number(params.providerId);

  const [provider, setProvider] = useState<BuyProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [feeCalc, setFeeCalc] = useState<BuyFeeCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BuyFormValues>({
    resolver: zodResolver(buySchema),
    mode: 'onChange'
  });

  const watchedAmount = form.watch("amount");
  const watchedCurrency = form.watch("currency");
  const debouncedAmount = useDebounce(watchedAmount, 500);

  const fetchProvider = useCallback(async () => {
      setLoading(true);
      setError(null);
      if (isNaN(providerId)) {
        setError("Indangamuntu y'umutanzi ntiyemewe.");
        setLoading(false);
        return;
      }
      try {
        const response = await api.getBuyProviders();
        const foundProvider = response.data.find((p: BuyProvider) => p.id === providerId);
        if (foundProvider) {
          setProvider(foundProvider);
          if (foundProvider.currencies.length > 0) {
            form.setValue('currency', foundProvider.currencies[0]);
          }
        } else {
          setError("Umukoresha ntabonetse.");
        }
      } catch (err: any) {
        setError(err.message || "Gushaka amakuru y'umutanzi biranse.");
      } finally {
        setLoading(false);
      }
  }, [providerId, form]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);
  
  const calculateFee = useCallback(async (amount: number, currency: string) => {
    if (!provider || !currency) return;
    setIsCalculating(true);
    setCalcError(null);
    try {
      const response = await api.calculateBuyFee(provider.id, amount, currency);
      setFeeCalc(response.data);
    } catch (err: any) {
      setCalcError(err.message || "Ntivyakunze guharura amafaranga yo kuriha.");
      setFeeCalc(null);
    } finally {
      setIsCalculating(false);
    }
  }, [provider]);

  useEffect(() => {
    if (debouncedAmount > 0 && watchedCurrency && form.formState.isValid) {
      calculateFee(debouncedAmount, watchedCurrency);
    } else {
      setFeeCalc(null);
      setCalcError(null);
    }
  }, [debouncedAmount, watchedCurrency, form.formState.isValid, calculateFee]);

  const onSubmit = async (data: BuyFormValues) => {
    if (!provider || !feeCalc) {
        toast({ variant: 'destructive', title: 'Ikosa', description: 'Guharura amafaranga yo kuriha ntikurarangira.' });
        return;
    }
    setIsSubmitting(true);
    try {
        const orderPayload: BuyOrderPayload = {
            direction: 'buy',
            provider_id: provider.id,
            amount: data.amount,
            amount_currency: data.currency,
            btc_amount: parseFloat(feeCalc.btc_amount)
        };
        const order = await api.createBuyOrder(orderPayload);
        toast({ title: 'Itangazo ryakozwe', description: `Itangazo ryawe #${order.data.id} ryakozwe.` });
        router.push(`/orders/${order.data.id}`);
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Itangazo Ryanse', description: err.message || 'Ntivyakunze gukora itangazo ryawe.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardHeader><Skeleton className="h-12 w-12 rounded-lg" /><div className="space-y-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-60" /></div></CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
        <div className="mx-auto max-w-lg">
            <Button variant="ghost" asChild className="-ml-4"><Link href="/buy"><ArrowLeft className="mr-2 size-4" />Subira inyuma ku Batanga serivisi</Link></Button>
            <Card className="mt-4 flex h-48 items-center justify-center">
                <div className="text-center text-destructive">
                    <AlertCircle className="mx-auto h-8 w-8" />
                    <p className="mt-2 font-semibold">Ikosa mu gupakira umutanzi</p>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
                    <Button onClick={fetchProvider} variant="secondary" className="mt-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" hidden={!loading}/>
                        Subira Ugerageze
                    </Button>
                </div>
            </Card>
        </div>
    )
  }

  if (!provider) return null;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Button variant="ghost" asChild className="-ml-4">
        <Link href="/buy">
          <ArrowLeft className="mr-2 size-4" />
          Subira inyuma ku Batanga serivisi
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start gap-4">
            {provider.image ? (
                <Image src={provider.image} alt={`${provider.name} logo`} width={48} height={48} className="rounded-lg border" />
            ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-secondary">
                    <Landmark className="size-6 text-muted-foreground" />
                </div>
            )}
           <div>
            <CardTitle className="text-2xl">{provider.name}</CardTitle>
            <CardDescription>{provider.description}</CardDescription>
           </div>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-base font-semibold">Umubare wo kugura</Label>
                      <div className="flex gap-2">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input id="amount" type="number" placeholder="100.00" {...field} value={field.value ?? ''} className="text-lg h-12" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 w-32">
                                                <SelectValue placeholder="Ifaranga" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {provider.currencies.map(c => <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                      </div>
                    </div>


                    {(isCalculating || feeCalc || calcError) && (
                        <div className="space-y-3 rounded-lg border bg-secondary/30 p-4">
                            {isCalculating && <div className="flex items-center justify-center text-muted-foreground text-sm"><Loader2 className="mr-2 size-4 animate-spin" />Guharura...</div>}
                            {calcError && <div className="text-center text-sm text-destructive">{calcError}</div>}
                            {feeCalc && (
                                <div className="space-y-4">
                                     <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-muted-foreground">Umubare</span><span>{feeCalc.amount} {feeCalc.currency}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Agashirukiramico</span><span>{feeCalc.fee} {feeCalc.currency}</span></div>
                                        <Separator />
                                        <div className="flex justify-between font-bold text-base"><span >Igiteranyo co kuriha</span><span>{feeCalc.total_amount} {feeCalc.currency}</span></div>
                                    </div>
                                    <Separator className="border-dashed" />
                                    <div className="flex items-center justify-between text-base">
                                        <span className="font-semibold flex items-center gap-2"><Bitcoin className="size-5 text-primary" /> Uzoronka</span>
                                        <span className="font-bold font-mono">{feeCalc.btc_amount} BTC</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </CardContent>
                <CardFooter>
                    <Button type="submit" size="lg" className="w-full" disabled={!feeCalc || isCalculating || isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ShoppingCart className="mr-2 size-5" />}
                        {isSubmitting ? "Gukora itangazo..." : "Kora Itangazo ryo kugura"}
                    </Button>
                </CardFooter>
            </form>
        </Form>
      </Card>
    </div>
  );
}
