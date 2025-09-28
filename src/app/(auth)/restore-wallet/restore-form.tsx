
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
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useEffect } from "react";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mnemonic: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await api.restoreWallet(values.mnemonic);
      const token = response.data.token;

      if (token) {
        localStorage.setItem('authToken', token);
        document.cookie = `authToken=${token}; path=/; max-age=604800; samesite=lax`;
      }
      
      toast({
        title: "Wallet Restored Successfully",
        description: "Your wallet is now ready. Welcome back!",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      const errorDetails = error.response?.data?.error?.details;
      const errorMsg = errorDetails?.data?.[0] || errorDetails?.mnemonic?.[0] || error.response?.data?.message || "Failed to restore wallet. Please check your recovery phrase.";
      toast({
        variant: "destructive",
        title: "Restore Failed",
        description: errorMsg,
      });
    } finally {
        setIsLoading(false);
    }
  }

  if (!isLoggedIn) {
      return (
          <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Not Logged In</AlertTitle>
              <AlertDescription>
                  You need to log in or create an account before you can restore a wallet.
              </AlertDescription>
          </Alert>
      )
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
