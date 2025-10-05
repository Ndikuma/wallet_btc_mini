
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Order, BuyProvider } from "@/lib/types";
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
  AlertTriangle,
  Banknote,
  User as UserIcon,
  Phone,
  Mail,
  Hourglass,
  AlertCircle,
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
import { Badge, badgeVariants } from "@/components/ui/badge";
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
    payment_proof_ref: z.string().min(4, "Veuillez entrer une référence valide."),
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

const PaymentInfoDisplay = ({ provider }: { provider: BuyProvider }) => {
    if (!provider.payment_info) return null;

    const accountDetails = provider.payment_info.account;
    const instructions = provider.payment_info.instructions;

    const formatLabel = (key: string) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Landmark className="size-5 text-primary" />Instructions de Paiement</CardTitle>
                {provider.payment_info.method && <CardDescription>{provider.payment_info.method}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                 {accountDetails && Object.keys(accountDetails).length > 0 && (
                     <div className="space-y-3 rounded-lg border bg-background/50 p-4">
                        <h4 className="font-semibold">Détails du compte</h4>
                        {Object.entries(accountDetails).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{formatLabel(key)}</span>
                                <div className="flex items-center gap-2 font-mono">
                                    <span>{value}</span>
                                    <CopyButton textToCopy={value as string} size="icon" variant="ghost" className="h-7 w-7" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {instructions && (
                    <div className="space-y-2">
                         <h4 className="font-semibold">Instructions</h4>
                        {Array.isArray(instructions) ? (
                            <ol className="list-decimal list-inside text-muted-foreground space-y-1 text-sm">
                                {instructions.map((step, i) => <li key={i}>{step}</li>)}
                            </ol>
                        ) : (
                            <p className="text-muted-foreground text-sm">{instructions}</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
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
                status: 'awaiting_confirmation' as const,
            };

            const response = await api.updateOrder(order.id, payload);
            toast({ title: "Preuve de paiement soumise", description: "Votre preuve a été soumise pour confirmation." });
            onSuccessfulSubmit(response.data);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Échec de la soumission", description: err.message || "Impossible de soumettre votre preuve." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Soumettre la preuve de paiement</CardTitle>
                <CardDescription>
                    Votre commande est en attente. Veuillez finaliser le paiement en utilisant les instructions ci-dessous, puis soumettez la preuve ici.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <PaymentInfoDisplay provider={order.provider} />

                        <FormField
                            control={form.control}
                            name="payment_proof_ref"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Référence de paiement / ID de transaction</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex: ID de transaction Mobile Money" {...field} />
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
                                    <FormLabel>Note (Optionnel)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Ajoutez des informations supplémentaires ici..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="space-y-2">
                            <Label htmlFor="payment_proof_image">Télécharger une image (Optionnel)</Label>
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
                            {isSubmitting ? "Envoi..." : "Confirmer le Paiement"}
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
        case 'awaiting_confirmation': return 'warning';
        case 'failed': return 'destructive';
        default: return 'secondary';
    }
}
const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed': return <CircleCheck className="size-6 text-green-500" />;
        case 'pending': return <Clock className="size-6 text-yellow-500" />;
        case 'awaiting_confirmation': return <Hourglass className="size-6 text-yellow-500" />;
        case 'failed': return <CircleX className="size-6 text-destructive" />;
        default: return <ReceiptText className="size-6" />;
    }
}

const PayoutDetailItem = ({ icon, label, value }: { icon: React.ElementType, label: string, value?: string | number | null }) => {
    if (!value) return null;
    const Icon = icon;
    return (
        <div className="flex items-center gap-3">
            <Icon className="size-4 text-muted-foreground" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold">{value}</p>
            </div>
        </div>
    )
}

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const orderId = Number(params.orderId);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (isNaN(orderId)) {
            setError("L'ID de la commande est invalide.");
            setLoading(false);
            return;
        }
        try {
            const response = await api.getOrder(orderId);
            setOrder(response.data);
        } catch (err: any) {
            setError(err.message || "Impossible de charger les détails de la commande.");
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

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
                <Button variant="ghost" asChild className="-ml-4"><Link href="/orders"><ArrowLeft className="mr-2 size-4" />Retour aux commandes</Link></Button>
                <Card className="mt-4 flex h-48 items-center justify-center">
                    <div className="text-center text-destructive">
                        <AlertCircle className="mx-auto h-8 w-8" />
                        <p className="mt-2 font-semibold">Erreur de chargement de la commande</p>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
                        <Button onClick={fetchOrder} variant="secondary" className="mt-4">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Réessayer
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    if (!order) return null;

    const payoutDetails = order.payout_data;
    
    return (
        <div className="mx-auto max-w-2xl space-y-6">
             <Button variant="ghost" asChild className="-ml-4">
                <Link href="/orders">
                <ArrowLeft className="mr-2 size-4" />
                Retour aux commandes
                </Link>
            </Button>
            
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                           {getStatusIcon(order.status)}
                           <div>
                                <CardTitle className="text-2xl capitalize">Commande d'{order.direction === 'buy' ? 'Achat' : 'Vente'} #{order.id}</CardTitle>
                                <CardDescription>le {new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric'})}</CardDescription>
                           </div>
                        </div>
                        <Badge variant={getStatusVariant(order.status)} className="capitalize text-base py-1 px-3">{order.status.replace('_', ' ')}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="space-y-2 rounded-lg border bg-secondary/30 p-4">
                         <div className="flex justify-between"><span className="text-muted-foreground">Montant</span><span>{order.amount} {order.amount_currency}</span></div>
                         <div className="flex justify-between"><span className="text-muted-foreground">Frais</span><span>{order.fee} {order.amount_currency}</span></div>
                         <Separator />
                         <div className="flex justify-between font-bold text-base"><span >Total</span><span>{order.total_amount} {order.amount_currency}</span></div>
                    </div>
                     <div className="space-y-2 rounded-lg border bg-secondary/30 p-4">
                         <div className="flex justify-between"><span className="text-muted-foreground">Fournisseur</span><span className="font-semibold">{order.provider.name}</span></div>
                         {order.provider.payment_info?.method && <div className="flex justify-between"><span className="text-muted-foreground">Méthode de paiement</span><span className="font-semibold">{order.provider.payment_info.method}</span></div>}
                    </div>
                </CardContent>
                 <CardFooter className="justify-end">
                    <Button variant="destructive">
                        <AlertTriangle className="mr-2 size-4" />
                        Signaler un problème
                    </Button>
                </CardFooter>
            </Card>

            {order.direction === 'sell' && payoutDetails && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Banknote className="size-5 text-primary" />
                           Informations de paiement
                        </CardTitle>
                        <CardDescription>Vos fonds seront envoyés à ce compte :</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <PayoutDetailItem icon={UserIcon} label="Nom complet" value={payoutDetails.full_name} />
                        <PayoutDetailItem icon={Phone} label="Numéro de téléphone" value={payoutDetails.phone_number} />
                        <PayoutDetailItem icon={Landmark} label="Numéro de compte" value={payoutDetails.account_number} />
                        <PayoutDetailItem icon={Mail} label="E-mail" value={payoutDetails.email} />
                    </CardContent>
                </Card>
            )}

            {order.status === 'completed' && order.btc_amount && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Bitcoin className="size-5 text-primary" />
                           Bitcoin Envoyé
                        </CardTitle>
                        <CardDescription>Cette commande est terminée et les Bitcoins ont été envoyés à votre portefeuille.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label>Montant</Label>
                            <div className="font-semibold font-mono text-lg">{order.btc_amount} BTC</div>
                        </div>
                        <div className="space-y-1">
                            <Label>Adresse de réception</Label>
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-muted-foreground">{shortenText(order.btc_address, 12, 12)}</p>
                                <CopyButton textToCopy={order.btc_address || ''} size="icon" variant="ghost" className="h-7 w-7"/>
                            </div>
                        </div>
                        {order.btc_txid && (
                           <>
                             <div className="space-y-1">
                                <Label>ID de transaction (TxID)</Label>
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

            {order.direction === 'buy' && order.status === 'pending' && <PaymentProofForm order={order} onSuccessfulSubmit={handleSuccessfulSubmit} />}

            {order.direction === 'buy' && order.status === 'awaiting_confirmation' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Hourglass className="size-5 text-primary" />En attente de confirmation</CardTitle>
                        <CardDescription>Votre preuve de paiement a été soumise et est en cours de vérification par le fournisseur.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Vous serez notifié lorsque votre paiement sera confirmé et que les Bitcoins seront envoyés à votre portefeuille. Cela peut prendre un certain temps.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

    