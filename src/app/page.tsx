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
          <nav className="hidden items-center gap-4 md:flex">
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
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
          <div className="container flex max-w-5xl flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
                Your Keys, Your Bitcoin.
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 lg:max-w-none">
                A beautifully simple, secure, and open-source wallet for managing your Bitcoin. Take full control of your digital assets with confidence.
              </p>
              <div className="flex justify-center gap-4 lg:justify-start">
                <Button asChild size="lg">
                  <Link href="/register">Create New Wallet</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/restore-wallet">Restore Wallet</Link>
                </Button>
              </div>
            </div>
             <div className="flex-1">
              <Image 
                src="https://picsum.photos/seed/bitcoin/600/600" 
                alt="Bitcoin wallet illustration"
                width={600}
                height={600}
                className="rounded-xl shadow-2xl"
                data-ai-hint="bitcoin crypto"
              />
            </div>
          </div>
        </section>
        <section
          id="features"
          className="container space-y-12 bg-secondary py-12 md:py-20 lg:py-24"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl">
              The Modern Standard for Your Bitcoin
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              mini wallet provides everything you need to manage your crypto assets with security and ease.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
             <CardFeature
              icon={<ShieldCheck className="mb-4 size-12 text-primary" />}
              title="Self-Custody Perfected"
              description="You hold the keys, you control your crypto. No third party can ever access, freeze, or lose your funds."
            />
             <CardFeature
              icon={<Zap className="mb-4 size-12 text-primary" />}
              title="Effortless Management"
              description="Our clean, intuitive interface makes sending, receiving, and tracking your Bitcoin a breeze for everyone."
            />
             <CardFeature
              icon={<CheckCircle className="mb-4 size-12 text-primary" />}
              title="Secure by Design"
              description="Protected by a 24-word recovery phrase and cutting-edge encryption, your assets are safe and sound."
            />
          </div>
        </section>
      </main>
      <footer className="bg-secondary py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Proudly open source. Built for the community, by the community.
          </p>
        </div>
      </footer>
    </div>
  );
}


function CardFeature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-background shadow-sm">
      {icon}
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
