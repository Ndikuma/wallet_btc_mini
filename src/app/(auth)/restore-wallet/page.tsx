
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RestoreForm } from "./restore-form"
import { BitcoinIcon } from "@/components/icons"
import Link from "next/link"

export default function RestoreWalletPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
       <Link href="/" className="mb-8 flex items-center gap-2">
        <BitcoinIcon className="size-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">
          mini wallet
        </h1>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Restore Wallet</CardTitle>
          <CardDescription>
            Enter your 12 or 24-word recovery phrase to restore your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RestoreForm />
           <div className="mt-4 text-center text-sm">
            Don&apos;t have a wallet?{" "}
            <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
              Create a new one
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
