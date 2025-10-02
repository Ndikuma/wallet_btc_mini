
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, { message: "Ndokera ushiremwo izina ryawe." }),
  password: z.string().min(1, { message: "Ndokera ushiremwo ijambo ry'ibanga." }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await api.login(values);
      const token = response.data.token;

      localStorage.setItem('authToken', token);
      document.cookie = `authToken=${token}; path=/; max-age=604800; samesite=lax`;

      toast({
        title: "Winjiye neza",
        description: "Kaze, garuka!",
      });

      const { user } = response.data;
      if (user.wallet_created) {
        router.push("/dashboard");
      } else {
        router.push("/create-or-restore");
      }
      router.refresh(); 

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Kwinjira biranse",
        description: error.message,
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
              <FormLabel>Izina ry'ukoresha</FormLabel>
              <FormControl>
                <Input type="text" placeholder="izina ryawe" {...field} autoComplete="username" />
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
              <FormLabel>Ijambo ry'ibanga</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="********" 
                    {...field} 
                    autoComplete="current-password"
                    className="pr-10"
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  aria-label={showPassword ? "Hisha ijambo ry'ibanga" : "Erekana ijambo ry'ibanga"}
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Kwinjira...' : 'Injira'}
        </Button>
      </form>
    </Form>
  );
}
