
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
            <CardTitle>Rungika Bitcoin</CardTitle>
            </div>
            <CardDescription>
            Injiza aderese y'uwakira n'umubare wo kurungika. Agashirukiramico keza kazoharurwa hisunzwe UTXOs. Irinde kurungika amafaranga yawe yose kuko bishobora gutera amakosa mu guharura agashirukiramico.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <SendForm />
        </CardContent>
      </Card>
    </div>
  );
}
