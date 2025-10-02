
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
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2 } from "lucide-react";

const formSchema = z.object({
  mnemonic: z.string().min(20, { message: "Amajambo yo kugarura asa n'aho ari magufi cane." })
    .refine(value => {
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount === 12 || wordCount === 24;
    }, "Amajambo agomba kuba 12 canke 24."),
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
        title: "Irembo ryagarutse neza",
        description: "Irembo ryawe riri tayari. Kaze garuka!",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Kugarura biranse",
        description: error.message,
      });
    } finally {
        setIsLoading(false);
    }
  }

  if (!isLoggedIn) {
      return (
          <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Nturinjira</AlertTitle>
              <AlertDescription>
                  Ugomba kwinjira canke gukora konti imbere yo kugarura irembo.
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
              <FormLabel>Amajambo yo kugarura</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Injiza amajambo 12 canke 24 atandukanijwe n'umwanya..."
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
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Kugarura...' : 'Garura Irembo'}
        </Button>
      </form>
    </Form>
  );
}
