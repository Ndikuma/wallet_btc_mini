import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SendForm } from "./send-form";

export default function SendPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Send Bitcoin</CardTitle>
          <CardDescription>
            Enter the recipient's address and amount to send, or scan a QR code. The optimal fee is suggested for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SendForm />
        </CardContent>
      </Card>
    </div>
  );
}
