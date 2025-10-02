
"use client";

import { Share2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ShareButtonProps extends ButtonProps {
  shareData: ShareData;
}


export function ShareButton({ shareData, children, className, ...props }: ShareButtonProps) {
  const { toast } = useToast();
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(!!navigator.share && navigator.canShare(shareData));
  }, [shareData]);


  const handleShare = async () => {
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Vyagiye neza",
        });
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
             toast({
                variant: "destructive",
                title: "Kusangira biranse",
                description: "Ntivyakunze gusangira amakuru yo kwishura.",
            });
        }
      }
    } else {
         toast({
            variant: "destructive",
            title: "Kusangira ntibikunda",
            description: "Browser yawe ntishobora gusangira ibi bintu.",
        });
    }
  };

  if (!canShare) {
      return null;
  }

  return (
    <Button onClick={handleShare} className={cn("w-full", className)} {...props}>
      <Share2 className="mr-2 size-4" />
      {children}
    </Button>
  );
}
