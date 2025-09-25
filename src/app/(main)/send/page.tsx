
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
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { FeeEstimation } from "@/lib/types";

function TransactionDetailRow({
  label,
  value,
  isAddress = false,
  isBold = false,
  className = "",
}: {
  label: string;
  value: string;
  isAddress?: boolean;
  isBold?: boolean;
  className?: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`max-w-[60%] text-right text-sm ${
          isAddress ? "break-all font-code" : ""
        } ${isBold ? "font-bold" : "font-medium"} ${className}`}
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
  const [feeEstimation, setFeeEstimation] = useState<FeeEstimation | null>(null);
  const [loadingFee, setLoadingFee] = useState(false);

  const handleFormSubmit = async (values: SendFormValues) => {
    setTransactionDetails(values);
    setLoadingFee(true);
    setStep("confirmation");
    
    try {
        const feeResponse = await api.estimateFee(values);
        setFeeEstimation(feeResponse.data);
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || "Could not estimate network fee. Please try again.";
        toast({
            variant: "destructive",
            title: "Fee Estimation Failed",
            description: errorMsg,
        });
        setStep("form");
    } finally {
        setLoadingFee(false);
    }
  };

  const handleBack = () => {
    setStep("form");
    setTransactionDetails(null);
    setFeeEstimation(null);
  };
  
  const totalAmount = (transactionDetails && feeEstimation)
    ? (transactionDetails.amount + parseFloat(feeEstimation.total_fee_btc)).toFixed(8)
    : "0";

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
                       <div className="space-y-3">
                         <div className="flex justify-between items-center">
                             <span className="text-sm text-muted-foreground">Network Fee</span>
                             <Skeleton className="h-5 w-24" />
                         </div>
                         <div className="flex justify-between items-center">
                             <span className="text-sm text-muted-foreground">Service Fee</span>
                             <Skeleton className="h-5 w-24" />
                         </div>
                       </div>
                    ) : feeEstimation ? (
                       <>
                        <TransactionDetailRow
                            label="Network Fee"
                            value={`${parseFloat(feeEstimation.network_fee_btc).toFixed(8)} BTC`}
                        />
                        <TransactionDetailRow
                            label="Service Fee"
                            value={`${parseFloat(feeEstimation.service_fee_btc).toFixed(8)} BTC`}
                        />
                       </>
                    ) : null}
                     <div className="my-2 border-t border-dashed border-border"></div>
                     {loadingFee ? (
                       <div className="flex justify-between items-center">
                           <span className="text-base font-bold text-muted-foreground">Total</span>
                           <Skeleton className="h-6 w-32" />
                       </div>
                    ) : (
                       <TransactionDetailRow
                        label="Total"
                        value={`${totalAmount} BTC`}
                        isBold
                        className="text-base"
                      />
                    )}
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
