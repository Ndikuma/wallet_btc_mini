
"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { ChartTooltipContent } from "@/components/ui/chart";

interface PriceChartProps {
  data: {
    prices: [number, number][];
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export default function PriceChart({ data }: PriceChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.prices) return [];
    return data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp),
      price: price,
    }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
        No chart data available.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-1 gap-2">
                       <div className="flex flex-col space-y-1">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {format(new Date(label), "MMM d, yyyy")}
                          </span>
                          <span className="font-bold text-foreground">
                            {formatCurrency(payload[0].value as number)}
                          </span>
                       </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
            dot={false}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
