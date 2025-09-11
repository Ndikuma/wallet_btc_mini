"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ArrowDownLeft,
  ArrowUpRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { transactions as allTransactions, Transaction } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const txDate = new Date(tx.date);
      const isAfterFrom = date?.from ? txDate >= date.from : true;
      const isBeforeTo = date?.to ? txDate <= date.to : true;
      const typeMatch = filterType === "all" || tx.type === filterType;
      const statusMatch = filterStatus === "all" || tx.status === filterStatus;
      return isAfterFrom && isBeforeTo && typeMatch && statusMatch;
    });
  }, [filterType, filterStatus, date]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          View and filter all your wallet transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="received">Received</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal sm:w-auto",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount (BTC)</TableHead>
              <TableHead className="hidden lg:table-cell">Address</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx) => (
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
                <TableCell className="hidden font-code lg:table-cell">
                  {tx.address.slice(0, 12)}...
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {new Date(tx.date).toLocaleString()}
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
             {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No transactions found for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
