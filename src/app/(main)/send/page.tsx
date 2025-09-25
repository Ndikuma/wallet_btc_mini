
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SendForm, type SendFormValues } from "./send-form";
import { Bitcoin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

function TransactionDetailRow({
  label,
  value,
  isAddress = false,
}: {
  label: string;
  value: string;
  isAddress?: boolean;
}) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`max-w-[60%] text-right text-sm font-medium ${
          isAddress ? "break-all font-code" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function SendPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "confirmation">("form");
  const [transactionDetails, setTransactionDetails] = useState<SendFormValues | null>(null);
  const [fee, setFee] = useState<number | null>(null);
  const [loadingFee, setLoadingFee] = useState(false);

  const handleFormSubmit = (values: SendFormValues) => {
    setTransactionDetails(values);
    setLoadingFee(true);
    setStep("confirmation");
    
    // Fee is now determined by backend, so we just set a placeholder here for display.
    // The actual fee will be calculated during the final transaction submission.
    // A mock fee is shown for UI purposes. In a real app, you might have an endpoint 
    // to estimate fee before sending.
    setTimeout(() => {
        setFee(0.00005); // Using a fallback fee for display
        setLoadingFee(false);
    }, 1000);
  };

  const handleBack = () => {
    setStep("form");
    setTransactionDetails(null);
    setFee(null);
  };
  
  const calculatedFee = fee ? fee.toFixed(8) : "0";
  const totalAmount = transactionDetails ? (transactionDetails.amount + (fee || 0)).toFixed(8) : "0";

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        {step === "form" && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Bitcoin className="size-6 text-primary" />
                </div>
                <CardTitle>Send Bitcoin</CardTitle>
              </div>
              <CardDescription>
                Enter the recipient's address and amount to send. The optimal
                fee will be calculated for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SendForm
                onFormSubmit={handleFormSubmit}
                initialData={transactionDetails}
              />
            </CardContent>
          </>
        )}

        {step === "confirmation" && transactionDetails && (
          <>
            <CardHeader>
              <div className="flex items-center gap-3">
                 <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                  <ArrowLeft className="size-5" />
                </Button>
                <CardTitle>Review Transaction</CardTitle>
              </div>
              <CardDescription>
                Please review the details below before confirming the transaction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                     <TransactionDetailRow
                        label="Recipient"
                        value={transactionDetails.recipient}
                        isAddress
                    />
                    <TransactionDetailRow
                        label="Amount"
                        value={`${transactionDetails.amount.toFixed(8)} BTC`}
                    />
                    {loadingFee ? (
                       <div className="flex justify-between items-center">
                           <span className="text-sm text-muted-foreground">Network Fee</span>
                           <Skeleton className="h-5 w-24" />
                       </div>
                    ) : (
                       <TransactionDetailRow
                          label="Network Fee (est.)"
                          value={`${calculatedFee} BTC`}
                      />
                    )}
                     <div className="my-2 border-t border-dashed border-border"></div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        {loadingFee ? <Skeleton className="h-6 w-28" /> : <span className="text-lg font-bold">{totalAmount} BTC</span>}
                    </div>
                </div>

                <SendForm
                    onFormSubmit={() => {}} // Final submit is handled in the form itself
                    initialData={transactionDetails}
                    isConfirmationStep={true}
                    onBack={handleBack}
                />
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
