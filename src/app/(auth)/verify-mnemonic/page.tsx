
"use client";

import { useState, useMemo, useEffect } from "react";
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
  
  // State for verification logic
  const [verificationWords, setVerificationWords] = useState<{ index: number; word: string }[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);

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
    // Randomly select 4 words to verify
    const indices = shuffle([...Array(allWords.length).keys()]).slice(0, 4);
    const selected = indices.map(index => ({ index, word: allWords[index] })).sort((a, b) => a.index - b.index);
    setVerificationWords(selected);

    // Create options for the user to choose from
    const correctWords = selected.map(w => w.word);
    const incorrectWords = shuffle(allWords.filter(w => !correctWords.includes(w))).slice(0, 4);
    setOptions(shuffle([...correctWords, ...incorrectWords]));

    setUserInputs(Array(selected.length).fill(""));
  }, [mnemonic]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };
  
  const handleVerify = async () => {
    setIsLoading(true);

    const isCorrect = verificationWords.every((v, i) => userInputs[i] === v.word);

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
        // Here you would typically associate the verified mnemonic with the user's wallet on the backend
        // Since the wallet is already created on register, we can just finalize the process.
        // For this example, we assume the backend knows the user from the auth token.
        // A real implementation might have a specific endpoint to confirm the mnemonic backup.
        
        toast({
            title: "Verification Successful",
            description: "Your wallet is ready and secured.",
        });
        localStorage.removeItem("tempMnemonic");
        router.push("/dashboard");
        router.refresh();
    } catch (error: any) {
        const errorMsg = error.response?.data?.detail || "An error occurred during verification.";
        toast({
            variant: "destructive",
            title: "Verification Failed",
            description: errorMsg,
        });
    } finally {
        setIsLoading(false);
    }
  };

  const allWordsEntered = userInputs.every(input => input.length > 0);

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
             {verificationWords.map(({index}, i) => (
                <div key={index} className="flex items-center gap-4">
                    <label htmlFor={`word-${index}`} className="w-16 text-right text-sm text-muted-foreground">Word #{index + 1}</label>
                    <select
                      id={`word-${index}`}
                      value={userInputs[i]}
                      onChange={(e) => handleInputChange(i, e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="" disabled>Select word...</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleVerify} className="w-full" size="lg" disabled={!allWordsEntered || isLoading}>
            {isLoading ? "Verifying..." : "Verify & Finish"}
          </Button>
           <Button variant="ghost" size="sm" onClick={() => setUserInputs(Array(verificationWords.length).fill(""))} disabled={isLoading}>
             <RefreshCcw className="mr-2 size-4" />
            Clear Selection
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

