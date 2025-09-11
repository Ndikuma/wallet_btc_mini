"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, X } from "lucide-react";

// In a real app, this would come from the previous step securely
const mockMnemonic = "drip salad theory later angle violin loan powder mammal hire isolate arena rocket reopen drink cause";

export default function VerifyMnemonicPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const shuffledWords = useMemo(() => 
    [...mockMnemonic.split(" ")].sort(() => Math.random() - 0.5), 
    []
  );

  const handleWordSelect = (word: string) => {
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleWordDeselect = (index: number) => {
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleVerify = () => {
      if (selectedWords.join(" ") === mockMnemonic) {
          toast({
              title: "Verification Successful",
              description: "Your wallet has been created securely.",
          });
          router.push("/dashboard");
      } else {
          toast({
              variant: "destructive",
              title: "Verification Failed",
              description: "The words are incorrect or in the wrong order. Please try again.",
          });
          setSelectedWords([]);
      }
  };

  const wordCount = mockMnemonic.split(" ").length;

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Verify Recovery Phrase</CardTitle>
          <CardDescription>
            Tap the words in the correct order to confirm you have backed up your phrase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex min-h-[120px] flex-wrap content-start items-start gap-2 rounded-lg border bg-background p-4">
             {selectedWords.map((word, index) => (
                <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer text-base"
                    onClick={() => handleWordDeselect(index)}
                >
                    <span className="mr-1.5 text-muted-foreground">{index + 1}.</span>
                    {word}
                    <X className="ml-1.5 size-3.5" />
                </Badge>
            ))}
            {selectedWords.length === 0 && (
                <p className="text-sm text-muted-foreground">Select words in the correct order below...</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {shuffledWords.map((word, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleWordSelect(word)}
                disabled={selectedWords.includes(word) && selectedWords.filter(w => w === word).length >= mockMnemonic.split(" ").filter(w => w === word).length}
              >
                {word}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleVerify} className="w-full" size="lg" disabled={selectedWords.length !== wordCount}>
            Verify & Finish
          </Button>
           <Button variant="ghost" size="sm" onClick={() => setSelectedWords([])} disabled={selectedWords.length === 0}>
             <RefreshCcw className="mr-2 size-4" />
            Clear Selection
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
