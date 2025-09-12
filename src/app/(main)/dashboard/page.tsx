
"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BitcoinIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import type { Wallet, Transaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AxiosError } from "axios";


const chartConfig = {
  price: {
    label: "Price (USD)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const INITIAL_BTC_TO_USD_RATE = 65000;
const INITIAL_BTC_TO_BIF_RATE = 200000000; // Mock rate for BTC to BIF

export default function DashboardPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [btcPrice, setBtcPrice] = useState(INITIAL_BTC_TO_USD_RATE);
  const [btcToBifRate, setBtcToBifRate] = useState(INITIAL_BTC_TO_BIF_RATE);
  const [priceMovement, setPriceMovement] = useState<"up" | "down" | "neutral">("neutral");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [walletRes, transactionsRes] = await Promise.all([
          api.get("/wallet/"),
          api.get("/transaction/?limit=4"),
        ]);
        setWallet(walletRes.data);
        setRecentTransactions(transactionsRes.data.results);
      } catch (err: any) {
        if (err instanceof AxiosError && err.response?.status === 403) {
            setError("Your wallet is being set up. This can take a moment. Please try refreshing in a few seconds.");
        } else {
            console.error("Failed to fetch dashboard data", err);
            setError("Could not load dashboard data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Simulate price history for the chart
    const generatePriceHistory = () => {
        let history = [];
        let price = INITIAL_BTC_TO_USD_RATE;
        const now = new Date();
        for (let i = 30; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            price += (Math.random() - 0.5) * 1000;
            history.push({
                date: date.toISOString().split('T')[0],
                price: price
            });
        }
        setPriceHistory(history);
    }
    generatePriceHistory();

    const interval = setInterval(() => {
      setBtcPrice(prevPrice => {
        const change = (Math.random() - 0.5) * 200;
        const newPrice = prevPrice + change;
        setPriceMovement(newPrice > prevPrice ? "up" : "down");
        // Also update BIF rate proportionally
        setBtcToBifRate(prevBifRate => prevBifRate * (newPrice / prevPrice));
        return newPrice;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const balanceUsd = useMemo(() => (wallet?.balance || 0) * btcPrice, [wallet, btcPrice]);
  const balanceBif = useMemo(() => (wallet?.balance || 0) * btcToBifRate, [wallet, btcToBifRate]);

  if (loading) {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-10 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[120px] w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }
  
    if (error) {
        const handleRefresh = () => {
             window.location.reload();
        };

        return (
            <div className="flex items-center justify-center h-full">
                <Alert variant="destructive" className="max-w-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Wallet Not Ready</AlertTitle>
                    <AlertDescription>
                        {error}
                        <div className="mt-4">
                            <Button onClick={handleRefresh}>Refresh</Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }


  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
             <CardTitle className="text-muted-foreground">Current Balance</CardTitle>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{balanceUsd.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                <div className={cn("flex items-center gap-1 text-sm font-medium", {
                    "text-green-600": priceMovement === 'up',
                    "text-destructive": priceMovement === 'down',
                })}>
                    {priceMovement === 'up' && <ArrowUp className="size-4" />}
                    {priceMovement === 'down' && <ArrowDown className="size-4" />}
                </div>
             </div>
             <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{(wallet?.balance || 0).toFixed(8)} BTC</span>
                <Separator orientation="vertical" className="h-4" />
                <span>≈ {((wallet?.balance || 0) * 100000000).toLocaleString()} Sats</span>
                 <Separator orientation="vertical" className="h-4" />
                <span>≈ {balanceBif.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}</span>
             </div>
          </CardHeader>
          <CardContent className="h-[120px] w-full pt-4">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  accessibilityLayer
                  data={priceHistory}
                  margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} hide />
                  <ChartTooltip
                    cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3'}}
                    content={<ChartTooltipContent 
                        indicator="dot" 
                        labelKey="date"
                        formatter={(value, name, props) => (
                           <div className="flex flex-col">
                                <span className="font-bold text-foreground">BTC Price: {(value as number).toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                                <span className="text-xs text-muted-foreground">{new Date(props.payload.date).toLocaleDateString()}</span>
                           </div>
                        )}
                    />}
                  />
                  <Area
                    dataKey="price"
                    type="monotone"
                    fill="url(#fillPrice)"
                    stroke="var(--color-price)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow grid grid-cols-2 gap-4">
            <Button size="lg" asChild className="h-auto py-4">
              <Link href="/send" className="flex flex-col items-center gap-2">
                <ArrowUpRight className="size-6" /> 
                <span>Send</span>
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="h-auto py-4">
              <Link href="/receive" className="flex flex-col items-center gap-2">
                <ArrowDownLeft className="size-6" /> 
                <span>Receive</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Transactions</CardTitle>
            </div>
            <Button variant="link" size="sm" asChild className="text-primary">
              <Link href="/transactions">
                See All
              </Link>
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id}>
                   <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                        {tx.type === "sent" ? (
                          <ArrowUpRight className="size-5 text-destructive" />
                        ) : (
                          <ArrowDownLeft className="size-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex flex-col">
                         <span className="font-medium">Bitcoin</span>
                        <span className="text-sm text-muted-foreground">{tx.status} - {new Date(tx.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-base",
                      tx.type === "sent" ? "text-destructive" : "text-green-600"
                    )}
                  >
                    {tx.type === "sent" ? "-" : "+"}
                    ${(tx.amount * btcPrice).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {recentTransactions.length === 0 && !loading && (
                <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">No recent transactions.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    