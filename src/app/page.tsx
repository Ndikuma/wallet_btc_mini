import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BitcoinIcon } from "@/components/icons";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2">
            <BitcoinIcon className="size-8 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">
              mini wallet
            </h2>
          </Link>
          <nav className="flex items-center gap-4">
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
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-headline text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              A secure & modern Bitcoin wallet.
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Take control of your Bitcoin with a simple, open-source wallet
              built for everyone. Send, receive, and manage your assets with
              ease.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/register">Create New Wallet</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/restore-wallet">Restore Wallet</Link>
              </Button>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to manage your Bitcoin securely.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Full Control</h3>
                  <p className="text-sm text-muted-foreground">
                    You are in complete control of your keys and your money. No
                    third party can freeze or lose your funds.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Easy to Use</h3>
                  <p className="text-sm text-muted-foreground">
                    A clean and intuitive interface makes sending and receiving
                    Bitcoin a breeze.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your wallet is protected with a 24-word recovery phrase and
                    industry-standard encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by You.
          </p>
        </div>
      </footer>
    </div>
  );
}
