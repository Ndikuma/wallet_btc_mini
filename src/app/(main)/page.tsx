
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    // Since this is the default page for the (main) layout,
    // we immediately redirect to the actual dashboard page.
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
