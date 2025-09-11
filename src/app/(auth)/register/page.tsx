import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RegisterForm } from "./register-form"
import { BitcoinIcon } from "@/components/icons"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <BitcoinIcon className="size-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">
          mini wallet
        </h1>
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details to create your secure wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              Login
            </Link>
          </div>
           <div className="mt-2 text-center text-sm">
            Want to restore an existing wallet?{" "}
            <Link href="/restore-wallet" className="font-semibold text-primary underline-offset-4 hover:underline">
              Restore Now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
