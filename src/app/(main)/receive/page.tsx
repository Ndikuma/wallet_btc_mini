import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { wallet } from "@/lib/data";
import { CopyButton } from "./copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReceivePage() {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${wallet.address}&bgcolor=F5F5F5`;

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Receive Bitcoin</CardTitle>
          <CardDescription>
            Share your address or QR code to receive payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <Image
              src={qrCodeUrl}
              alt="Wallet Address QR Code"
              width={256}
              height={256}
              className="rounded-md"
              data-ai-hint="qr code"
            />
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="wallet-address" className="sr-only">
              Wallet Address
            </Label>
            <Input
              id="wallet-address"
              value={wallet.address}
              readOnly
              className="text-center font-code text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This is your unique Bitcoin address.
            </p>
          </div>
          <CopyButton text={wallet.address} />
        </CardContent>
      </Card>
    </div>
  );
}
