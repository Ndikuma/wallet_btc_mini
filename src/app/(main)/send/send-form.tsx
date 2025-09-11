"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpRight } from "lucide-react";
import { wallet } from "@/lib/data";

const formSchema = z.object({
  recipient: z
    .string()
    .min(26, { message: "Bitcoin address is too short." })
    .max(62, { message: "Bitcoin address is too long." }),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be positive." })
    .max(wallet.balance, { message: "Insufficient balance." }),
  fee: z.array(z.number()).default([50]),
});

const recommendedFee = 50;

export function SendForm() {
  const { toast } = useToast();
  const [feeValue, setFeeValue] = useState(recommendedFee);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      amount: 0,
      fee: [recommendedFee],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    
    toast({
      title: "Transaction Submitted",
      description: `Sending ${values.amount} BTC to ${values.recipient.slice(0,10)}...`,
    });
    
    // Simulate network delay
    setTimeout(() => {
       toast({
        variant: "default",
        title: "Transaction Successful",
        description: "Your Bitcoin has been sent.",
       });
       form.reset();
       setFeeValue(recommendedFee);
    }, 2000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="recipient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Address</FormLabel>
              <FormControl>
                <Input placeholder="bc1q..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (BTC)</FormLabel>
              <FormControl>
                <Input type="number" step="0.0001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Transaction Fee (sats/vB) -{" "}
                <span className="text-primary">{feeValue}</span>
              </FormLabel>
              <FormControl>
                <div className="relative pt-2">
                  <Slider
                    min={10}
                    max={200}
                    step={1}
                    defaultValue={[recommendedFee]}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setFeeValue(value[0]);
                    }}
                  />
                  <div className="absolute left-0 top-0 text-xs text-muted-foreground w-full flex justify-center">
                     <div style={{ left: `calc(${((recommendedFee - 10) / (200 - 10)) * 100}% - 12px)`}} className="absolute flex flex-col items-center">
                        <div className="h-2 w-px bg-primary"></div>
                        <span className="text-primary font-medium">Recommended</span>
                     </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="lg">
          <ArrowUpRight className="mr-2 size-5" />
          Send Bitcoin
        </Button>
      </form>
    </Form>
  );
}
