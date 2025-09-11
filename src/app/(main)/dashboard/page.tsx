"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  TrendingUp,
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

const chartConfig = {
  balance: {
    label: "Balance (BTC)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="flex items-center gap-2 text-4xl">
              <BitcoinIcon className="size-8" />
              {wallet.balance.toFixed(4)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-xs text-muted-foreground">
              Your total Bitcoin balance across all accounts.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/transactions">
                View All <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Send or receive Bitcoin with a single click.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow grid grid-cols-2 gap-4">
            <Button size="lg" asChild>
              <Link href="/send">
                <ArrowUpRight className="mr-2 size-5" /> Send
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/receive">
                <ArrowDownLeft className="mr-2 size-5" /> Receive
              </Link>
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Securely manage your assets.
            </p>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-start gap-2 space-y-0">
             <TrendingUp className="size-6" />
            <div className="grid gap-1">
              <CardTitle>Balance History</CardTitle>
              <CardDescription>
                Your balance trend over the last 30 days.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer config={chartConfig} className="h-40 w-full">
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
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-balance)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="balance"
                  type="natural"
                  fill="url(#fillBalance)"
                  stroke="var(--color-balance)"
                  stackId="a"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            A quick look at your latest wallet activity.
          </CardDescription>
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
                    <div className="flex items-center gap-2">
                      {tx.type === "sent" ? (
                        <ArrowUpRight className="size-4 text-destructive" />
                      ) : (
                        <ArrowDownLeft className="size-4 text-primary" />
                      )}
                      <span className="capitalize">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell
                    className={
                      tx.type === "sent" ? "text-destructive" : "text-primary"
                    }
                  >
                    {tx.type === "sent" ? "-" : "+"}
                    {tx.amount.toFixed(4)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
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