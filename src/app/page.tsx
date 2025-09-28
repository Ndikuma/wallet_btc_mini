
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BitcoinIcon } from "@/components/icons";
import { ArrowRight } from "lucide-react";


export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-sm">
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
           <nav className="flex items-center gap-2 md:hidden">
             <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">
                  Get Started
                </Link>
              </Button>
           </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full flex h-full min-h-[calc(100vh-80px)] flex-grow flex-col items-center justify-center space-y-8 py-24 text-center md:py-32">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background animated-gradient"></div>
            <div className="max-w-4xl px-4">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Your Keys, Your Bitcoin.
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Take full control of your Bitcoin with a simple, secure, open-source wallet built for everyone. Send, receive, and manage your assets with confidence.
              </p>
              <div className="mt-8 flex w-full flex-col justify-center gap-4 sm:flex-row md:justify-center">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/register">Create New Wallet</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                    <Link href="/restore-wallet">Restore Wallet</Link>
                  </Button>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
