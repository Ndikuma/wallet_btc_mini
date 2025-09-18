
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BitcoinIcon } from "@/components/icons";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container z-40">
        <div className="flex h-20 items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-3">
            <BitcoinIcon className="size-8 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">
              mini wallet
            </h2>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get Started <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="container flex max-w-2xl flex-col items-center gap-8">
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Your Keys, Your Bitcoin.
              </h1>
              <p className="max-w-xl leading-normal text-muted-foreground sm:text-lg sm:leading-8">
                Take full control of your Bitcoin with a simple, secure, open-source wallet built for everyone. Send, receive, and manage your assets with confidence.
              </p>
            </div>
             <div className="flex w-full flex-col justify-center gap-4 sm:max-w-md sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/register">Create New Wallet</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Link href="/restore-wallet">Restore Wallet</Link>
                </Button>
              </div>
        </div>
      </main>
    </div>
  );
}
