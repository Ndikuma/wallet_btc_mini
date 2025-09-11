
"use client";

import { useState } from "react";
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
        className={`max-w-[70%] text-right text-sm font-medium ${
          isAddress ? "break-all font-code" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

type TransactionDetails = SendFormValues & { fee: number };

export default function SendPage() {
  const [step, setStep] = useState<"form" | "confirmation">("form");
  const [
    transactionDetails,
    setTransactionDetails,
  ] = useState<TransactionDetails | null>(null);

  const handleFormSubmit = (values: TransactionDetails) => {
    setTransactionDetails(values);
    setStep("confirmation");
  };

  const handleBack = () => {
    setStep("form");
    setTransactionDetails(null);
  };
  
  const calculatedFee = transactionDetails ? (transactionDetails.amount * (transactionDetails.fee / 50000)).toFixed(8) : "0";
  const totalAmount = transactionDetails ? (transactionDetails.amount + parseFloat(calculatedFee)).toFixed(8) : "0";


  return (
    <div className="mx-auto max-w-md">
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
                fee will be suggested for you.
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
                        value={`${transactionDetails.amount} BTC`}
                    />
                    <TransactionDetailRow
                        label="Network Fee"
                        value={`${calculatedFee} BTC`}
                    />
                     <div className="my-2 border-t border-dashed border-border"></div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="text-lg font-bold">{totalAmount} BTC</span>
                    </div>
                </div>

                <SendForm
                    onFormSubmit={() => {}} // Final submit is handled here
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
