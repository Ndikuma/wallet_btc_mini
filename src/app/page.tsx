
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import LandingPage from './landing-page';

export default function RootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.replace('/');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-sm">
                <div className="container flex h-20 items-center justify-between py-6">
                    <Skeleton className="h-8 w-40" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <section className="w-full flex h-full min-h-[calc(100vh-80px)] flex-grow flex-col items-center justify-center space-y-8 py-24 text-center md:py-32">
                    <div className="max-w-4xl px-4 space-y-6">
                         <Skeleton className="h-16 w-full max-w-3xl mx-auto" />
                         <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
                         <Skeleton className="h-6 w-full max-w-xl mx-auto" />
                         <div className="mt-8 flex w-full flex-col justify-center gap-4 sm:flex-row md:justify-center">
                            <Skeleton className="h-12 w-40" />
                            <Skeleton className="h-12 w-40" />
                         </div>
                    </div>
                </section>
            </main>
        </div>
    );
  }

  return <LandingPage />;
}

    