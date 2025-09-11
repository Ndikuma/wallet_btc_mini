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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mnemonic: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Add actual mnemonic validation logic here
    toast({
      title: "Wallet Restored",
      description: "Welcome back!",
    });
    router.push("/dashboard");
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
        <Button type="submit" className="w-full">
          Restore Wallet
        </Button>
      </form>
    </Form>
  );
}
