
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
import { Input } from "@/components/ui/input";


const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
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
      username: "",
      password: "",
      mnemonic: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // First, log in to get a token if the user is valid
      const loginResponse = await api.post<AuthResponse>('/auth/login/', { username: values.username, password: values.password });
      localStorage.setItem('authToken', loginResponse.data.token);

      // Then, restore the wallet with the new token
      await api.post('/wallet/restore/', { mnemonic: values.mnemonic });
      
      toast({
        title: "Wallet Restored",
        description: "Welcome back!",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      const errorDetails = error.response?.data?.error?.details;
      const errorMsg = errorDetails?.detail || errorDetails?.non_field_errors?.[0] || errorDetails?.mnemonic?.[0] || error.response?.data?.message || "Failed to restore wallet. Please check your details.";
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" placeholder="yourusername" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
