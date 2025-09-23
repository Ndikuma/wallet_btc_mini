
"use client";

import { useState, useEffect } from "react";
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
import { RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

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
  
  const [verificationWords, setVerificationWords] = useState<{ index: number; word: string }[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>([]);

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
    const indices = shuffle([...Array(allWords.length).keys()]).slice(0, 4);
    const selected = indices.map(index => ({ index, word: allWords[index] })).sort((a, b) => a.index - b.index);
    setVerificationWords(selected);
    setUserInputs(Array(selected.length).fill(""));
  }, [mnemonic]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };
  
  const handleVerify = async () => {
    setIsLoading(true);

    const isCorrect = verificationWords.every((v, i) => userInputs[i].trim().toLowerCase() === v.word.toLowerCase());

    if (!isCorrect) {
       toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "One or more words are incorrect. Please try again.",
        });
       setIsLoading(false);
       return;
    }

    if (!mnemonic) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Mnemonic phrase not found.",
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

  const allWordsEntered = userInputs.every(input => input.trim().length > 0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Verify Recovery Phrase</CardTitle>
          <CardDescription>
            Enter the specified words from your recovery phrase to confirm your backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 rounded-lg border bg-background p-4">
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {verificationWords.map(({index}, i) => (
                    <div key={index} className="flex items-center gap-2">
                        <Label htmlFor={`word-${index}`} className="w-16 text-right text-sm text-muted-foreground">Word #{index + 1}</Label>
                        <Input
                          id={`word-${index}`}
                          type="text"
                          value={userInputs[i]}
                          onChange={(e) => handleInputChange(i, e.target.value)}
                           className="w-full"
                           autoComplete="off"
                        />
                    </div>
                ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleVerify} className="w-full" size="lg" disabled={!allWordsEntered || isLoading}>
            {isLoading ? "Verifying..." : "Verify & Finish"}
          </Button>
           <Button variant="ghost" size="sm" onClick={() => setUserInputs(Array(verificationWords.length).fill(""))} disabled={isLoading}>
             <RefreshCcw className="mr-2 size-4" />
            Clear Inputs
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
