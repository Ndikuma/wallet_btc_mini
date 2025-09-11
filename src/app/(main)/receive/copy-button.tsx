"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function CopyButton({ text }: { text: string }) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Payment details have been copied.",
    });
  };

  return (
    <Button onClick={handleCopy} variant="outline">
      <Copy className="mr-2 size-4" />
      Copy
    </Button>
  );
}
