
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
  data: z.string().min(20, { message: "Recovery data seems too short." })
    .refine(value => {
        const trimmed = value.trim();
        const wordCount = trimmed.split(/\s+/).length;
        const isMnemonic = wordCount === 12 || wordCount === 24;
        const isWif = (trimmed.startsWith('L') || trimmed.startsWith('K') || trimmed.startsWith('5'));
        const isExtendedKey = /^(xpub|ypub|zpub|tpub|upub|vpub)/.test(trimmed);
        
        return isMnemonic || isWif || isExtendedKey;
    }, "Please enter a valid 12/24-word phrase or a WIF/extended private key."),
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
            title: "Backup Failed",
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
        title: "Wallet Restore Initialized",
        description: "Your wallet is being restored. The app will reload.",
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Restore Failed",
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
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>
            Choose how values are displayed across the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <Label htmlFor="currency">Fiat Currency</Label>
              <p className="text-sm text-muted-foreground">
                Set your preferred currency for display.
              </p>
            </div>
            <Select
              value={settings.currency}
              onValueChange={(value) => setCurrency(value as "usd" | "eur" | "jpy" | "bif")}
            >
              <SelectTrigger id="currency" className="w-full sm:w-48">
                <SelectValue placeholder="Select currency" />
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
            <Label className="font-medium">Primary Display Unit</Label>
            <p className="text-sm text-muted-foreground pt-1">Select the main unit for displaying your balance.</p>
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
          <CardTitle>Security & Data</CardTitle>
          <CardDescription>Manage wallet security and data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <Label htmlFor="2fa" className="font-semibold">Two-Factor Authentication (2FA)</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your wallet.</p>
            </div>
            <Switch id="2fa" />
          </div>
          <div className="flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <p className="font-semibold">Backup Wallet</p>
              <p className="text-sm text-muted-foreground">Reveal your WIF private key. Store it securely offline.</p>
            </div>
            <Button onClick={handleBackup} className="w-full sm:w-auto" disabled={isBackupLoading}>
              {isBackupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Backup Now
            </Button>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <p className="font-semibold">Restore Wallet</p>
              <p className="text-sm text-muted-foreground">Restore from a recovery phrase or WIF private key.</p>
            </div>
            <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Restore</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore Your Wallet</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter your 12/24-word recovery phrase or WIF private key. This will replace the current wallet on this account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Form {...restoreForm}>
                        <form onSubmit={restoreForm.handleSubmit(handleRestoreSubmit)} className="space-y-4">
                            <FormField
                                control={restoreForm.control}
                                name="data"
                                render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Recovery Data</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Enter your recovery phrase or WIF key..."
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
                                <Button type="button" variant="ghost" onClick={() => setIsRestoreDialogOpen(false)} disabled={isRestoring}>Cancel</Button>
                                <Button type="submit" disabled={isRestoring}>
                                    {isRestoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isRestoring ? "Restoring..." : "Restore Wallet"}
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
                  <AlertDialogTitle>Your Wallet Private Key (WIF)</AlertDialogTitle>
                  <AlertDialogDescription>
                      This is your private key. It provides full access to your funds.
                      Keep it secret and store it in a safe, offline location.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Security Warning</AlertTitle>
                    <AlertDescription>
                        Never share this key with anyone. Anyone with this key can steal your funds.
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
                  <Button variant="outline" onClick={closeBackupDialog} className="mt-0 w-full sm:w-auto">Close</Button>
                  <CopyButton
                    textToCopy={wif || ''}
                    disabled={isBackupLoading || !wif}
                    toastMessage="Private key copied"
                    onCopy={closeBackupDialog}
                    className="w-full sm:w-auto"
                   >
                    Copy Key & Close
                   </CopyButton>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
