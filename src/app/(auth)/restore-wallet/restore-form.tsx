
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { AuthResponse } from "@/lib/types";
import { useState } from "react";

const formSchema = z.object({
  mnemonic: z.string().min(20, { message: "Recovery phrase seems too short." })
    .refine(value => {
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount === 12 || wordCount === 24;
    }, "Phrase must be 12 or 24 words."),
});

export function RestoreForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mnemonic: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // This assumes you have an account and are restoring the wallet for it.
      // A more complete flow might involve asking for email/password as well.
      const response = await api.post<AuthResponse>('/wallets/restore/', values);
      localStorage.setItem('authToken', response.data.token);
      toast({
        title: "Wallet Restored",
        description: "Welcome back!",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.mnemonic?.[0] || "Failed to restore wallet. Please check your phrase.";
      toast({
        variant: "destructive",
        title: "Restore Failed",
        description: errorMsg,
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mnemonic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recovery Phrase</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the 12 or 24 words separated by spaces..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Restoring...' : 'Restore Wallet'}
        </Button>
      </form>
    </Form>
  );
}
