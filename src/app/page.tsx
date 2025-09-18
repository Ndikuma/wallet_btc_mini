
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BitcoinIcon } from "@/components/icons";
import { ArrowRight, CheckCircle, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container z-40">
        <div className="flex h-20 items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2">
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
      <main className="flex flex-1 flex-col items-center justify-center">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container flex max-w-5xl flex-col items-center gap-12 text-center">
            <div className="flex flex-1 justify-center lg:order-last">
              <Image 
                src="https://picsum.photos/seed/bitcoin-dark/600/600" 
                alt="Bitcoin wallet illustration"
                width={500}
                height={500}
                className="rounded-xl shadow-2xl shadow-primary/10"
                data-ai-hint="bitcoin crypto dark"
              />
            </div>
            <div className="flex flex-1 flex-col items-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Your Keys, Your Bitcoin.
              </h1>
              <p className="max-w-2xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Take full control of your Bitcoin with a simple, secure, open-source wallet built for everyone. Send, receive, and manage your assets with confidence.
              </p>
              <div className="flex w-full flex-col justify-center gap-4 sm:max-w-md sm:flex-row lg:w-auto">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/register">Create New Wallet</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Link href="/restore-wallet">Restore Wallet</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full bg-secondary/20 py-12 md:py-20 lg:py-24"
        >
          <div className="container space-y-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="text-3xl font-bold leading-[1.1] tracking-tighter sm:text-4xl md:text-5xl">
                Why Choose mini wallet?
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                We provide the tools you need to manage your Bitcoin with security and ease.
                </p>
            </div>
            <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                <CardFeature
                icon={<ShieldCheck className="mb-4 size-12 text-primary" />}
                title="Full Control"
                description="You are in complete control of your keys and your money. No third party can freeze or lose your funds."
                />
                <CardFeature
                icon={<Zap className="mb-4 size-12 text-primary" />}
                title="Easy to Use"
                description="A clean and intuitive interface makes sending and receiving Bitcoin a breeze, for beginners and experts alike."
                />
                <CardFeature
                icon={<CheckCircle className="mb-4 size-12 text-primary" />}
                title="Secure by Design"
                description="Your wallet is protected with a 24-word recovery phrase and industry-standard encryption."
                />
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-secondary/20 py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by You. Powered by Open Source.
          </p>
        </div>
      </footer>
    </div>
  );
}


function CardFeature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card shadow-sm">
      {icon}
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
