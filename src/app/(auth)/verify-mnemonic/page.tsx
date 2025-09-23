
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
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { X, Undo2 } from "lucide-react";

// Function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Function to get 4 random unique indices from 0 to 11
const getRandomIndices = () => {
  const indices = new Set<number>();
  while (indices.size < 4) {
    indices.add(Math.floor(Math.random() * 12));
  }
  return Array.from(indices).sort((a, b) => a - b);
};

export default function VerifyMnemonicPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [originalWords, setOriginalWords] = useState<string[]>([]);
  
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [challengeIndices, setChallengeIndices] = useState<number[]>([]);
  
  // State to hold the user's answers for each slot { index: word }
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
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
      const words = storedMnemonic.split(" ");
      setMnemonic(storedMnemonic);
      setOriginalWords(words);
      setShuffledWords(shuffleArray(words));
      setChallengeIndices(getRandomIndices());
    }
  }, [router, toast]);

  const handleWordBankClick = (word: string) => {
    if (Object.values(answers).includes(word)) return; // Word already used
    setSelectedWord(word);
  };

  const handleChallengeSlotClick = (index: number) => {
    if (!selectedWord) return; // No word selected from bank
    
    setAnswers(prev => ({ ...prev, [index]: selectedWord }));
    setSelectedWord(null);
  };

  const handleClear = () => {
    setAnswers({});
    setSelectedWord(null);
  };

  const handleVerify = async () => {
    setIsLoading(true);

    const isCorrect = challengeIndices.every(index => answers[index] === originalWords[index]);

    if (!isCorrect) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "One or more words are incorrect. Please try again.",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (!mnemonic) throw new Error("Mnemonic not found");

      // Construct the payload with only the challenged words and their indices
      const verificationPayload: { [key: string]: string } = {};
      challengeIndices.forEach(index => {
        // API probably expects 1-based indexing, but let's stick to what's logical first
        // based on user request to send index. Assuming 0-based for now.
        // The prompt implies sending the index-word mapping for verification.
        verificationPayload[String(index)] = originalWords[index];
      });
      
      // We also need to send the full mnemonic so the backend can create the wallet
      const finalPayload = {
        mnemonic,
        words_to_verify: verificationPayload
      }

      await api.verifyMnemonic(finalPayload);

      toast({
        title: "Verification Successful",
        description: "Your wallet is ready and secured.",
      });
      localStorage.removeItem("tempMnemonic");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.details?.detail || error.response?.data?.message || "An error occurred during verification.";
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const allWordsEntered = Object.keys(answers).length === 4;

  if (challengeIndices.length === 0) {
    return null; // Don't render until component is ready
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>Verify Your Phrase</CardTitle>
          <CardDescription>
            Select the correct word from the list below for each required position to prove you have backed up your phrase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Challenge Slots */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {challengeIndices.map(index => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Word #{index + 1}</label>
                <button
                  type="button"
                  onClick={() => handleChallengeSlotClick(index)}
                  disabled={!!answers[index]}
                  className={cn(
                    "flex h-12 w-full items-center justify-center rounded-md border-2 border-dashed bg-background font-code text-lg font-medium",
                    answers[index] ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground",
                    selectedWord && !answers[index] ? "border-primary bg-primary/10" : ""
                  )}
                >
                  {answers[index] || "?"}
                </button>
              </div>
            ))}
          </div>
          
          {/* Word Bank */}
          <div className="rounded-lg border bg-background/50 p-4">
            <div className="flex flex-wrap justify-center gap-3">
              {shuffledWords.map(word => {
                const isUsed = Object.values(answers).includes(word);
                return (
                  <Button
                    key={word}
                    variant={selectedWord === word ? "default" : "outline"}
                    disabled={isUsed}
                    onClick={() => handleWordBankClick(word)}
                    className={cn(
                        "font-code text-base transition-all",
                        isUsed ? "opacity-30" : "opacity-100",
                        selectedWord === word ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                    )}
                  >
                    {word}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-center">
             <Button variant="ghost" onClick={handleClear} disabled={Object.keys(answers).length === 0 || isLoading}>
                <Undo2 className="mr-2 size-4" />
                Clear selections
            </Button>
          </div>

        </CardContent>
        <CardFooter>
          <Button onClick={handleVerify} size="lg" className="w-full" disabled={!allWordsEntered || isLoading}>
            {isLoading ? "Verifying..." : "Verify & Finish"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
