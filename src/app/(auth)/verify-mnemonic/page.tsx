
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  
  // State for the 4 random words to verify
  const [verificationWords, setVerificationWords] = useState<{ index: number; value: string }[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>(Array(4).fill(''));

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
      const words = storedMnemonic.split(" ");
      const randomIndices = getRandomIndices();
      setVerificationWords(
        randomIndices.map(index => ({ index, value: words[index] }))
      );
    }
  }, [router, toast]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value.trim().toLowerCase();
    setUserInputs(newInputs);
  };

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

    const isCorrect = verificationWords.every((wordInfo, i) => userInputs[i] === wordInfo.value);

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

  const allWordsEntered = userInputs.every(input => input.length > 0) && userInputs.length === 4;

  if (verificationWords.length === 0) {
    return null; // Don't render until indices are selected
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Verify Your Phrase</CardTitle>
          <CardDescription>
            Enter the specified words from your recovery phrase to confirm your backup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {verificationWords.map((wordInfo, i) => (
              <div key={wordInfo.index} className="space-y-2">
                <Label htmlFor={`word-${i}`} className="font-semibold">
                  Word #{wordInfo.index + 1}
                </Label>
                <Input
                  id={`word-${i}`}
                  type="text"
                  autoComplete="off"
                  value={userInputs[i]}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  className="font-code text-base"
                  disabled={isLoading}
                />
              </div>
            ))}
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
