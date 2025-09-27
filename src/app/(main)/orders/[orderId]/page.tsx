
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  Clock,
  Landmark,
  FileImage,
  Loader2,
  ReceiptText,
  Copy,
  ExternalLink,
  Bitcoin,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge, badgeVariants } from "@/components/badge";
import { VariantProps } from "class-variance-authority";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/copy-button";
import { shortenText } from "@/lib/utils";

const paymentProofSchema = z.object({
    payment_proof_ref: z.string().min(4, "Please enter a valid payment reference."),
    note: z.string().optional(),
    payment_proof_image: z.any().optional(),
});

type PaymentProofFormValues = z.infer<typeof paymentProofSchema>;


function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

function PaymentProofForm({ order, onSuccessfulSubmit }: { order: Order, onSuccessfulSubmit: (updatedOrder: Order) => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<PaymentProofFormValues>({
        resolver: zodResolver(paymentProofSchema),
        defaultValues: {
            payment_proof_ref: "",
            note: "",
        },
    });
    
    const fileRef = form.register("payment_proof_image");

    const onSubmit = async (values: PaymentProofFormValues) => {
        setIsSubmitting(true);
        try {
            let image_base64: string | null = null;
            if (values.payment_proof_image && values.payment_proof_image.length > 0) {
                const file = values.payment_proof_image[0];
                image_base64 = await fileToBase64(file);
            }

            const payload = {
                payment_proof: { 
                    tx_id: values.payment_proof_ref,
                    image_base64: image_base64,
                },
                note: values.note,
            };

            const response = await api.updateOrder(order.id, payload);
            toast({ title: "Payment Proof Submitted", description: "Your proof has been sent for confirmation." });
            onSuccessfulSubmit(response.data);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Submission Failed", description: err.message || "Could not submit your payment proof." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Submit Payment Proof</CardTitle>
                <CardDescription>
                    Your order is pending. Please complete the payment using the instructions below and submit proof here.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <Card className="bg-secondary/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg"><Landmark className="size-5 text-primary" />Payment Instructions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{order.provider.payment_info.instructions}</p>
                            </CardContent>
                        </Card>

                        <FormField
                            control={form.control}
                            name="payment_proof_ref"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Reference / Tx ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Mobile Money transaction ID" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Add any extra details here..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="space-y-2">
                            <Label htmlFor="payment_proof_image">Upload Screenshot (Optional)</Label>
                            <Input 
                                id="payment_proof_image" 
                                type="file" 
                                accept="image/*"
                                {...fileRef}
                                className="text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20" 
                             />
                         </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin"/> : <CircleCheck className="mr-2 size-4" />}
                            {isSubmitting ? "Submitting..." : "Confirm Payment"}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}

const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
    switch (status.toLowerCase()) {
        case 'completed': return 'success';
        case 'pending': return 'warning';
        case 'failed': return 'destructive';
        default: return 'secondary';
    }
}
const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed': return <CircleCheck className="size-6 text-green-500" />;
        case 'pending': return <Clock className="size-6 text-yellow-500" />;
        case 'failed': return <CircleX className="size-6 text-destructive" />;
        default: return <ReceiptText className="size-6" />;
    }
}

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const orderId = Number(params.orderId);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isNaN(orderId)) {
            setError("Invalid order ID.");
            setLoading(false);
            return;
        }
        async function fetchOrder() {
            try {
                const response = await api.getOrder(orderId);
                setOrder(response.data);
            } catch (err: any) {
                setError(err.message || "Failed to load order details.");
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [orderId]);

    const handleSuccessfulSubmit = (updatedOrder: Order) => {
        setOrder(updatedOrder);
    }
    
    if (loading) {
        return (
            <div className="mx-auto max-w-2xl space-y-4">
                <Skeleton className="h-8 w-32" />
                <Card><CardHeader><Skeleton className="h-8 w-48" /><Skeleton className="h-5 w-64" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mx-auto max-w-2xl">
                <Button variant="ghost" asChild className="-ml-4"><Link href="/orders"><ArrowLeft className="mr-2 size-4" />Back to Orders</Link></Button>
                <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
            </div>
        )
    }

    if (!order) return null;
    
    return (
        <div className="mx-auto max-w-2xl space-y-6">
             <Button variant="ghost" asChild className="-ml-4">
                <Link href="/orders">
                <ArrowLeft className="mr-2 size-4" />
                Back to Orders
                </Link>
            </Button>
            
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                           {getStatusIcon(order.status)}
                           <div>
                                <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
                                <CardDescription>on {new Date(order.created_at).toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric'})}</CardDescription>
                           </div>
                        </div>
                        <Badge variant={getStatusVariant(order.status)} className="capitalize text-base py-1 px-3">{order.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="space-y-2 rounded-lg border bg-secondary/30 p-4">
                         <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span>{order.amount} {order.amount_currency}</span></div>
                         <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span>{order.fee} {order.amount_currency}</span></div>
                         <Separator />
                         <div className="flex justify-between font-bold text-base"><span >Total Paid</span><span>{order.total_amount} {order.amount_currency}</span></div>
                    </div>
                     <div className="space-y-2 rounded-lg border bg-secondary/30 p-4">
                         <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span className="font-semibold">{order.provider.name}</span></div>
                         <div className="flex justify-between"><span className="text-muted-foreground">Payment Method</span><span className="font-semibold">{order.provider.payment_info.method}</span></div>
                    </div>
                </CardContent>
            </Card>

            {order.status === 'completed' && order.btc_amount && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Bitcoin className="size-5 text-primary" />
                           Bitcoin Sent
                        </CardTitle>
                        <CardDescription>This order is complete and Bitcoin has been sent to your wallet.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label>Amount</Label>
                            <div className="font-semibold font-mono text-lg">{order.btc_amount} BTC</div>
                        </div>
                        <div className="space-y-1">
                            <Label>Destination Address</Label>
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-muted-foreground">{shortenText(order.btc_address, 12, 12)}</p>
                                <CopyButton textToCopy={order.btc_address || ''} size="icon" variant="ghost" className="h-7 w-7"/>
                            </div>
                        </div>
                        {order.btc_txid && (
                           <>
                             <div className="space-y-1">
                                <Label>Transaction ID (TxID)</Label>
                                <div className="flex items-center gap-2">
                                    <p className="font-mono text-muted-foreground">{shortenText(order.btc_txid, 12, 12)}</p>
                                    <CopyButton textToCopy={order.btc_txid || ''} size="icon" variant="ghost" className="h-7 w-7"/>
                                </div>
                            </div>
                            {/* You need a valid explorer link structure */}
                            {/* <Button variant="outline" asChild>
                                <Link href={`https://mempool.space/tx/${order.btc_txid}`} target="_blank">
                                    View on Block Explorer <ExternalLink className="ml-2 size-4" />
                                </Link>
                            </Button> */}
                           </>
                        )}
                    </CardContent>
                </Card>
            )}

            {order.status === 'pending' && <PaymentProofForm order={order} onSuccessfulSubmit={handleSuccessfulSubmit} />}
        </div>
    );
}

    