
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { RefreshCcw, Eraser } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// Function to shuffle an array
const shuffle = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export default function VerifyMnemonicPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  
  useEffect(() => {
    const storedMnemonic = localStorage.getItem("tempMnemonic");
    if (!storedMnemonic) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mnemonic phrase not found. Please create a wallet first.",
      });
      router.push("/create-wallet");
    } else {
      setMnemonic(storedMnemonic);
    }
  }, [router, toast]);

  useEffect(() => {
    if (!mnemonic) return;

    const allWords = mnemonic.split(" ");
    setShuffledWords(shuffle([...allWords]));
    setSelectedWords([]);
  }, [mnemonic]);
  
  const handleWordSelect = (word: string) => {
    if (selectedWords.length < 12) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleWordDeselect = (index: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  }

  const handleClear = () => {
    setSelectedWords([]);
  }

  const handleVerify = async () => {
    setIsLoading(true);

    if (!mnemonic) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Mnemonic phrase not found.",
        });
        setIsLoading(false);
        return;
    }
    
    const isCorrect = selectedWords.join(" ") === mnemonic;

    if (!isCorrect) {
       toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "The order of the words is incorrect. Please try again.",
        });
       setIsLoading(false);
       return;
    }

    try {
        await api.verifyMnemonic(mnemonic);
        toast({
            title: "Verification Successful",
            description: "Your wallet is ready and secured.",
        });
        localStorage.removeItem("tempMnemonic");
        router.push("/dashboard");
        router.refresh();
    } catch (error: any) {
        const errorMsg = error.response?.data?.error?.details?.detail || "An error occurred during verification.";
        toast({
            variant: "destructive",
            title: "Verification Failed",
            description: errorMsg,
        });
    } finally {
        setIsLoading(false);
    }
  };

  const allWordsEntered = selectedWords.length === 12;
  const isWordUsed = (word: string) => selectedWords.includes(word);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Verify Your Phrase</CardTitle>
          <CardDescription>
            Tap the words in the correct order to confirm your backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="min-h-[14rem] rounded-lg border-2 border-dashed bg-background p-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                 {Array.from({ length: 12 }).map((_, index) => (
                    <div
                      key={index}
                      onClick={() => handleWordDeselect(index)}
                      className={cn(
                        "flex items-baseline rounded-md border py-2 px-3",
                        selectedWords[index] ? 'border-primary bg-secondary cursor-pointer' : 'border-transparent'
                      )}
                    >
                      <span className="mr-3 text-sm text-muted-foreground">{index + 1}.</span>
                      <span className="font-code text-base font-medium">{selectedWords[index]}</span>
                    </div>
                ))}
              </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {shuffledWords.map((word, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleWordSelect(word)}
                disabled={isWordUsed(word) || allWordsEntered || isLoading}
                className={cn(
                    "font-code text-base",
                    isWordUsed(word) && "opacity-20"
                )}
              >
                {word}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
           <Button variant="ghost" onClick={handleClear} disabled={isLoading || selectedWords.length === 0}>
             <Eraser className="mr-2 size-4" />
            Clear
          </Button>
          <Button onClick={handleVerify} size="lg" disabled={!allWordsEntered || isLoading}>
            {isLoading ? "Verifying..." : "Verify & Finish"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
