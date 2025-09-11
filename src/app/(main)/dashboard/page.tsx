
"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUp,
  ArrowDown,
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
import { Area, AreaChart, XAxis } from "recharts";
import { wallet, transactions, balanceHistory } from "@/lib/data";
import { BitcoinIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const chartConfig = {
  balance: {
    label: "Balance (BTC)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const INITIAL_BTC_TO_USD_RATE = 65000;
const BTC_TO_BIF_RATE = 186550000; // Mock exchange rate

export default function DashboardPage() {
  const recentTransactions = transactions.slice(0, 4);
  const [displayUnit, setDisplayUnit] = useState("usd");
  const [btcPrice, setBtcPrice] = useState(INITIAL_BTC_TO_USD_RATE);
  const [priceMovement, setPriceMovement] = useState<"up" | "down" | "neutral">("neutral");


  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prevPrice => {
        const change = (Math.random() - 0.5) * 200; // Fluctuate by +/- $100
        const newPrice = prevPrice + change;
        if (newPrice > prevPrice) {
            setPriceMovement("up");
        } else {
            setPriceMovement("down");
        }
        return newPrice;
      });
    }, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const displayBalance = () => {
    switch (displayUnit) {
      case "sats":
        return (wallet.balance * 100_000_000).toLocaleString("en-US", { maximumFractionDigits: 0 });
      case "bif":
        return (wallet.balance * BTC_TO_BIF_RATE).toLocaleString("en-US", { style: "currency", currency: "BIF" });
      case "btc":
        return wallet.balance.toFixed(8);
      case "usd":
      default:
        return (wallet.balance * btcPrice).toLocaleString("en-US", { style: "currency", currency: "USD" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
             <CardTitle className="text-muted-foreground">Current Balance</CardTitle>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{displayBalance()}</span>
                <div className={cn("flex items-center gap-1 text-sm font-medium", {
                    "text-green-600": priceMovement === 'up',
                    "text-destructive": priceMovement === 'down',
                })}>
                    {priceMovement === 'up' && <ArrowUp className="size-4" />}
                    {priceMovement === 'down' && <ArrowDown className="size-4" />}
                    <span>+420.00 this week</span>
                </div>
             </div>
          </CardHeader>
          <CardContent className="h-[120px] w-full pt-4">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  accessibilityLayer
                  data={balanceHistory}
                  margin={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-balance)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-balance)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <ChartTooltip
                    cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3'}}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="balance"
                    type="monotone"
                    fill="url(#fillBalance)"
                    stroke="var(--color-balance)"
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
                        <span className="text-sm text-muted-foreground">{tx.status === 'completed' ? 'Complete' : 'In Progress'} - {new Date(tx.date).toLocaleDateString()}</span>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
