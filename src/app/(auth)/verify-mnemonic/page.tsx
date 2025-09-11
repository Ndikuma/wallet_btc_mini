"use client";

import { useState } from "react";
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

// In a real app, this would come from the previous step securely
const mockMnemonic = "drip salad theory later angle violin loan powder mammal hire isolate arena";
const shuffledWords = [...mockMnemonic.split(" ")].sort(() => Math.random() - 0.5);

export default function VerifyMnemonicPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Verify Recovery Phrase</CardTitle>
          <CardDescription>
            Tap the words in the correct order to verify you have saved your
            recovery phrase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex min-h-[100px] flex-wrap items-center gap-2 rounded-lg border bg-muted p-4">
             {selectedWords.map((word, index) => (
                <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer text-base"
                    onClick={() => handleWordDeselect(index)}
                >
                    {word}
                </Badge>
            ))}
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
          <Button onClick={handleVerify} className="w-full" disabled={selectedWords.length !== 12}>
            Verify & Finish
          </Button>
           <Button variant="ghost" size="sm" onClick={() => setSelectedWords([])}>
            Clear Selection
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
