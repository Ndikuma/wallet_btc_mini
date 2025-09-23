
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BitcoinIcon } from "@/components/icons";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-transparent bg-background/80 backdrop-blur-sm">
        <div className="container flex h-20 items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-3">
            <BitcoinIcon className="size-8 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">
              mini wallet
            </h2>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get Started <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </nav>
           <Button asChild className="md:hidden">
              <Link href="/register">
                Get Started
              </Link>
            </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-12 py-12 md:grid-cols-2 lg:py-24">
          <div className="flex flex-col items-start space-y-6 text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Your Keys, Your Bitcoin.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Take full control of your Bitcoin with a simple, secure, open-source wallet built for everyone. Send, receive, and manage your assets with confidence.
            </p>
             <div className="flex w-full flex-col justify-center gap-4 sm:flex-row md:justify-start">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/register">Create New Wallet</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Link href="/restore-wallet">Restore Wallet</Link>
                </Button>
              </div>
          </div>
           <div className="relative h-80 w-full overflow-hidden rounded-xl border shadow-lg md:h-full">
            <Image
                src="https://picsum.photos/seed/crypto-wallet/1200/800"
                alt="Secure wallet illustration"
                fill
                className="object-cover"
                data-ai-hint="secure wallet"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
          </div>
        </section>
      </main>
    </div>
  );
}
