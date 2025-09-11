"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export function ShareButton({ text, amount }: { text: string, amount: string }) {
  const { toast } = useToast();
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);


  const handleShare = async () => {
    const shareData = {
        title: "Bitcoin Payment Request",
        text: `Please send ${amount ? amount + ' BTC' : 'Bitcoin'} to the following address: ${text}`,
        url: text
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
        });
      } catch (error) {
        // Silently fail if user cancels share dialog
        if ((error as DOMException).name !== 'AbortError') {
             toast({
                variant: "destructive",
                title: "Failed to share",
                description: "Could not share the payment details.",
            });
        }
      }
    } else {
         toast({
            variant: "destructive",
            title: "Sharing not supported",
            description: "Your browser does not support the Web Share API.",
        });
    }
  };

  if (!canShare) {
      return null;
  }

  return (
    <Button onClick={handleShare}>
      <Share2 className="mr-2 size-4" />
      Share
    </Button>
  );
}
