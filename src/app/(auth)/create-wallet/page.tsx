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
const mockMnemonic = "drip salad theory later angle violin loan powder mammal hire isolate arena rocket reopen drink cause";

export default function CreateWalletPage() {
  const mnemonicWords = mockMnemonic.split(" ");
  const firstHalf = mnemonicWords.slice(0, 12);
  const secondHalf = mnemonicWords.slice(12);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Your Recovery Phrase</CardTitle>
          <CardDescription>
            This 24-word phrase is the only way to recover your wallet.
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
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 font-code text-lg sm:grid-cols-3 md:grid-cols-4">
              {mnemonicWords.map((word, index) => (
                  <div key={index} className="flex items-baseline">
                    <span className="mr-3 text-sm text-muted-foreground">{index + 1}.</span>
                    <span>{word}</span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href="/verify-mnemonic">I've written it down</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
