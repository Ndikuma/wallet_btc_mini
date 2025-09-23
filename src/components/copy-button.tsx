
"use client";

import { Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends ButtonProps {
  textToCopy: string;
  toastMessage?: string;
}

export function CopyButton({ textToCopy, toastMessage, children, className, ...props }: CopyButtonProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: toastMessage || "Copied to clipboard",
    });
  };

  return (
    <Button onClick={handleCopy} className={cn("w-full", className)} {...props}>
      <Copy className="mr-2 size-4" />
      {children}
    </Button>
  );
}
