
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from "@/context/settings-context";
import api from "@/lib/api";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyButton } from "@/components/copy-button";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const restoreFormSchema = z.object({
  data: z.string().min(20, { message: "Les données de restauration semblent trop courtes." })
    .refine(value => {
        const trimmed = value.trim();
        const wordCount = trimmed.split(/\s+/).length;
        const isMnemonic = wordCount === 12 || wordCount === 24;
        const isWif = (trimmed.startsWith('L') || trimmed.startsWith('K') || trimmed.startsWith('5'));
        const isExtendedKey = /^(xpub|ypub|zpub|tpub|upub|vpub)/.test(trimmed);
        
        return isMnemonic || isWif || isExtendedKey;
    }, "Veuillez entrer une phrase mnémonique valide de 12/24 mots ou une clé privée WIF/étendue."),
});

export function SettingsClient() {
  const { toast } = useToast();
  const { settings, setCurrency, setDisplayUnit } = useSettings();
  const [wif, setWif] = useState<string | null>(null);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const restoreForm = useForm<z.infer<typeof restoreFormSchema>>({
    resolver: zodResolver(restoreFormSchema),
    defaultValues: { data: "" },
  });


  const handleBackup = async () => {
    setIsBackupLoading(true);
    setIsBackupDialogOpen(true);
    try {
        const response = await api.backupWallet();
        setWif(response.data.wif);
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Échec de la sauvegarde",
            description: error.message,
        });
        setIsBackupDialogOpen(false);
    } finally {
        setIsBackupLoading(false);
    }
  };

  const closeBackupDialog = () => {
    setIsBackupDialogOpen(false);
    setWif(null);
  }

  const handleRestoreSubmit = async (values: z.infer<typeof restoreFormSchema>) => {
    setIsRestoring(true);
    try {
      await api.restoreWallet(values.data);
      toast({
        title: "Restauration du portefeuille lancée",
        description: "Votre portefeuille est en cours de restauration. L'application va se rafraîchir.",
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Échec de la restauration",
        description: error.message,
      });
    } finally {
      setIsRestoring(false);
      setIsRestoreDialogOpen(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Préférences d'Affichage</CardTitle>
          <CardDescription>
            Choisissez comment les valeurs sont affichées dans l'application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <Label htmlFor="currency">Devise</Label>
              <p className="text-sm text-muted-foreground">
                Définissez votre devise fiat préférée.
              </p>
            </div>
            <Select
              value={settings.currency}
              onValueChange={(value) => setCurrency(value as "usd" | "eur" | "jpy" | "bif")}
            >
              <SelectTrigger id="currency" className="w-full sm:w-48">
                <SelectValue placeholder="Choisir la devise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
                <SelectItem value="jpy">JPY</SelectItem>
                <SelectItem value="bif">BIF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-medium">Unité d'Affichage Principale</Label>
            <p className="text-sm text-muted-foreground pt-1">Sélectionnez l'unité principale pour afficher votre solde.</p>
            <RadioGroup
              value={settings.displayUnit}
              onValueChange={(value) => setDisplayUnit(value as "btc" | "sats" | "usd" | "bif")}
              className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4"
            >
              <RadioGroupItem value="btc" id="btc" className="sr-only peer" />
              <Label htmlFor="btc" className="flex h-16 flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer sm:h-auto sm:py-4 sm:text-base">BTC</Label>
              <RadioGroupItem value="sats" id="sats" className="sr-only peer" />
              <Label htmlFor="sats" className="flex h-16 flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer sm:h-auto sm:py-4 sm:text-base">Sats</Label>
              <RadioGroupItem value="usd" id="usd" className="sr-only peer" />
              <Label htmlFor="usd" className="flex h-16 flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer sm:h-auto sm:py-4 sm:text-base">USD</Label>
              <RadioGroupItem value="bif" id="bif" className="sr-only peer" />
              <Label htmlFor="bif" className="flex h-16 flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer sm:h-auto sm:py-4 sm:text-base">BIF</Label>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sécurité & Données</CardTitle>
          <CardDescription>Gérez la sécurité et les données du portefeuille.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <Label htmlFor="2fa" className="font-semibold">Authentification à deux facteurs (2FA)</Label>
              <p className="text-sm text-muted-foreground">Ajoutez une couche de sécurité supplémentaire à votre portefeuille.</p>
            </div>
            <Switch id="2fa" />
          </div>
          <div className="flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <p className="font-semibold">Sauvegarder le Portefeuille</p>
              <p className="text-sm text-muted-foreground">Affichez votre clé privée WIF. Sauvegardez-la dans un endroit sûr et hors ligne.</p>
            </div>
            <Button onClick={handleBackup} className="w-full sm:w-auto" disabled={isBackupLoading}>
              {isBackupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sauvegarder maintenant
            </Button>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <p className="font-semibold">Restaurer le Portefeuille</p>
              <p className="text-sm text-muted-foreground">Restaurez à partir d'une phrase mnémonique ou d'une clé privée WIF.</p>
            </div>
            <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Restaurer</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restaurer Votre Portefeuille</AlertDialogTitle>
                        <AlertDialogDescription>
                            Entrez votre phrase mnémonique de 12/24 mots ou votre clé privée WIF. Cela remplacera le portefeuille actuel de ce compte.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Form {...restoreForm}>
                        <form onSubmit={restoreForm.handleSubmit(handleRestoreSubmit)} className="space-y-4">
                            <FormField
                                control={restoreForm.control}
                                name="data"
                                render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Données de Restauration</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Entrez votre phrase mnémonique ou clé WIF..."
                                          className="resize-none"
                                          rows={4}
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <AlertDialogFooter className="pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsRestoreDialogOpen(false)} disabled={isRestoring}>Annuler</Button>
                                <Button type="submit" disabled={isRestoring}>
                                    {isRestoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isRestoring ? "Restauration..." : "Restaurer le portefeuille"}
                                </Button>
                            </AlertDialogFooter>
                        </form>
                    </Form>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Votre Clé Privée de Portefeuille (WIF)</AlertDialogTitle>
                  <AlertDialogDescription>
                      C'est votre clé privée. Elle donne un accès complet à vos fonds.
                      Gardez-la secrète et sauvegardez-la dans un endroit sûr et hors ligne.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Avertissement de Sécurité</AlertTitle>
                    <AlertDescription>
                        Ne partagez jamais cette clé avec qui que ce soit. Toute personne ayant cette clé peut voler vos fonds.
                    </AlertDescription>
                </Alert>

                <div className="rounded-lg border bg-secondary p-4 text-center font-code break-all">
                    {isBackupLoading ? (
                        <Skeleton className="h-5 w-4/5 mx-auto" />
                    ) : (
                        wif
                    )}
                </div>
              </div>
              <AlertDialogFooter className="pt-4 sm:gap-2 gap-4 flex-col sm:flex-row">
                  <Button variant="outline" onClick={closeBackupDialog} className="mt-0 w-full sm:w-auto">Fermer</Button>
                  <CopyButton
                    textToCopy={wif || ''}
                    disabled={isBackupLoading || !wif}
                    toastMessage="Clé privée copiée"
                    onCopy={closeBackupDialog}
                    className="w-full sm:w-auto"
                   >
                    Copier la clé & Fermer
                   </CopyButton>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
