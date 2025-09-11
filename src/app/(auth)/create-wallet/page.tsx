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

// In a real app, this would be generated securely
const mockMnemonic = "drip salad theory later angle violin loan powder mammal hire isolate arena";

export default function CreateWalletPage() {
  const mnemonicWords = mockMnemonic.split(" ");
  const half = Math.ceil(mnemonicWords.length / 2);
  const firstHalf = mnemonicWords.slice(0, half);
  const secondHalf = mnemonicWords.slice(half);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Your Recovery Phrase</CardTitle>
          <CardDescription>
            Write down these 12 words in order and store them in a safe
            place. This is the only way to recover your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Never share this phrase!</AlertTitle>
            <AlertDescription>
              Anyone with this phrase can take your Bitcoin.
            </AlertDescription>
          </Alert>
          <div className="rounded-lg border bg-muted p-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 font-code text-lg">
              <div className="space-y-4">
                {firstHalf.map((word, index) => (
                  <div key={index}>
                    <span className="text-muted-foreground">{index + 1}. </span>
                    {word}
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                 {secondHalf.map((word, index) => (
                  <div key={index}>
                    <span className="text-muted-foreground">{index + half + 1}. </span>
                    {word}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/verify-mnemonic">I've written it down</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
