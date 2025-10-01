
import { BitcoinIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Import } from "lucide-react";
import Link from "next/link";

export default function CreateOrRestorePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <BitcoinIcon className="size-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Umuhora Tech Wallet</h1>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set Up Your Wallet</CardTitle>
          <CardDescription>
            You're logged in, but you don't have a wallet yet.
            <br />
            Create a new one or restore an existing wallet to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link
            href="/create-wallet"
            className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-8 text-center transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <PlusCircle className="size-12 text-primary" />
            <div className="space-y-1">
              <h3 className="font-semibold">Create a New Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Generate a brand new, secure Bitcoin wallet.
              </p>
            </div>
          </Link>

          <Link
            href="/restore-wallet"
            className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-8 text-center transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Import className="size-12 text-primary" />
            <div className="space-y-1">
              <h3 className="font-semibold">Restore Existing Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Import your wallet using a 12 or 24-word recovery phrase.
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
