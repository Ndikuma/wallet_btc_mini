
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SendForm } from "./send-form";
import { Bitcoin } from "lucide-react";


export default function SendPage() {

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bitcoin className="size-6 text-primary" />
            </div>
            <CardTitle>Send Bitcoin</CardTitle>
            </div>
            <CardDescription>
            Enter the recipient's address and amount to send. The optimal
            fee will be calculated for you. Avoid sending your entire balance as this can cause errors with fee estimation.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <SendForm />
        </CardContent>
      </Card>
    </div>
  );
}
