
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Source_Code_Pro } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const fontCode = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-code',
});


export const metadata: Metadata = {
  title: 'Umuhora Tech Wallet',
  description: 'Un portefeuille Bitcoin simple et non-custodial',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={cn("font-body antialiased", fontBody.variable, fontCode.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
