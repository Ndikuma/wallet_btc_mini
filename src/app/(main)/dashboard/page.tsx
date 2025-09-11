
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
  CardFooter,
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
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { wallet, transactions, balanceHistory } from "@/lib/data";
import { BitcoinIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  const [displayUnit, setDisplayUnit] = useState("btc");
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
      case "usd":
        return (wallet.balance * btcPrice).toLocaleString("en-US", { style: "currency", currency: "USD" });
      case "bif":
        return (wallet.balance * BTC_TO_BIF_RATE).toLocaleString("en-US", { style: "currency", currency: "BIF" });
      case "btc":
      default:
        return wallet.balance.toFixed(8);
    }
  };

  const displayUnitLabel = () => {
    switch (displayUnit) {
      case "sats":
        return "sats";
      case "usd":
        return "USD";
      case "bif":
        return "BIF";
      case "btc":
      default:
        return "BTC";
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader>
             <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-muted-foreground">Portfolio Value</CardTitle>
                   <div className="flex items-baseline gap-2 text-4xl font-bold">
                    {displayUnit !== 'usd' && displayUnit !== 'bif' && <BitcoinIcon className="size-7 text-primary" />}
                    <span>{displayBalance()}</span>
                    <span className="text-xl font-medium text-muted-foreground">{displayUnitLabel()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className="flex items-baseline gap-2 text-2xl font-bold">
                      <span>{btcPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                       <div className={cn("flex items-center gap-1 text-sm font-medium", {
                          "text-green-600": priceMovement === 'up',
                          "text-destructive": priceMovement === 'down',
                      })}>
                          {priceMovement === 'up' && <ArrowUp className="size-4" />}
                          {priceMovement === 'down' && <ArrowDown className="size-4" />}
                      </div>
                  </div>
                  <ToggleGroup type="single" value={displayUnit} onValueChange={(value) => value && setDisplayUnit(value)} aria-label="Display Unit" size="sm">
                    <ToggleGroupItem value="btc" aria-label="Bitcoin">BTC</ToggleGroupItem>
                    <ToggleGroupItem value="sats" aria-label="Satoshi">SATS</ToggleGroupItem>
                    <ToggleGroupItem value="usd" aria-label="US Dollar">USD</ToggleGroupItem>
                    <ToggleGroupItem value="bif" aria-label="Burundian Franc">BIF</ToggleGroupItem>
                  </ToggleGroup>
                </div>
             </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="h-[200px] w-full pt-4">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  accessibilityLayer
                  data={balanceHistory}
                  margin={{
                    left: 0,
                    right: 12,
                    top: 10,
                    bottom: 0,
                  }}
                >
                   <defs>
                    <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-balance)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-balance)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50"/>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" labelClassName="font-bold" />}
                  />
                  <Area
                    dataKey="balance"
                    type="natural"
                    fill="url(#fillBalance)"
                    stroke="var(--color-balance)"
                    strokeWidth={2}
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Send or receive Bitcoin instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow grid grid-cols-2 gap-4">
            <Button size="lg" asChild className="h-auto py-4">
              <Link href="/send" className="flex flex-col gap-2">
                <ArrowUpRight className="size-6" /> 
                <span>Send</span>
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="h-auto py-4">
              <Link href="/receive" className="flex flex-col gap-2">
                <ArrowDownLeft className="size-6" /> 
                <span>Receive</span>
              </Link>
            </Button>
          </CardContent>
          <CardFooter>
             <p className="text-xs text-muted-foreground">
              Securely manage your assets.
            </p>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                    A quick look at your latest wallet activity.
                </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/transactions">
                View All <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount (BTC)</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                        {tx.type === "sent" ? (
                          <ArrowUpRight className="size-4 text-destructive" />
                        ) : (
                          <ArrowDownLeft className="size-4 text-primary" />
                        )}
                      </div>
                      <span className="font-medium capitalize">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-mono",
                      tx.type === "sent" ? "text-destructive" : "text-green-600"
                    )}
                  >
                    {tx.type === "sent" ? "-" : "+"}
                    {tx.amount.toFixed(4)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        tx.status === "completed"
                          ? "default"
                          : tx.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {tx.status}
                    </Badge>
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
