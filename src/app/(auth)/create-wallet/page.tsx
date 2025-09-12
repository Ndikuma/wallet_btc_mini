
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateWalletPage() {
  const { toast } = useToast();
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generateMnemonic() {
      try {
        const response = await api.post<{ mnemonic: string }>("/wallet/generate_mnemonic/");
        setMnemonic(response.data.mnemonic);
        localStorage.setItem("tempMnemonic", response.data.mnemonic);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Wallet Creation Failed",
          description: "Could not generate a recovery phrase. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
    generateMnemonic();
  }, [toast]);

  const mnemonicWords = mnemonic?.split(" ") || Array(12).fill(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Your Recovery Phrase</CardTitle>
          <CardDescription>
            This 12-word phrase is the only way to recover your wallet.
            <br />
            Write them down in order and store them in a safe, offline place.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive" className="bg-destructive/10">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Never share this phrase!</AlertTitle>
            <AlertDescription>
              Anyone with this phrase can steal your Bitcoin. Do not save it digitally.
            </AlertDescription>
          </Alert>
          <div className="rounded-lg border bg-background p-6">
            {loading ? (
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 font-code text-lg sm:grid-cols-3">
                {mnemonicWords.map((_, index) => (
                  <Skeleton key={index} className="h-6 w-24" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 font-code text-lg sm:grid-cols-3">
                {mnemonicWords.map((word, index) => (
                  <div key={index} className="flex items-baseline">
                    <span className="mr-3 text-sm text-muted-foreground">{index + 1}.</span>
                    <span>{word}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" size="lg" disabled={loading}>
            <Link href="/verify-mnemonic">I've written it down</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
