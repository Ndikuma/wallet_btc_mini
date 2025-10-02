
import { BitcoinIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Import } from "lucide-react";
import Link from "next/link";

export default function CreateOrRestorePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <BitcoinIcon className="size-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Umuhora Tech Wallet</h1>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Shiramwo Irembo Ry'amafaranga</CardTitle>
          <CardDescription>
            Winjiye, ariko nturagira irembo ry'amafaranga.
            <br />
            Kora irindi rishasha canke ugarure iryo wari usanganywe kugira utangure.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link
            href="/create-wallet"
            className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-8 text-center transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <PlusCircle className="size-12 text-primary" />
            <div className="space-y-1">
              <h3 className="font-semibold">Kurema Irembo Rishasha</h3>
              <p className="text-sm text-muted-foreground">
                Kora irembo rishasha ry'amafaranga ya Bitcoin rizivye.
              </p>
            </div>
          </Link>

          <Link
            href="/restore-wallet"
            className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-8 text-center transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Import className="size-12 text-primary" />
            <div className="space-y-1">
              <h3 className="font-semibold">Kugarura Irembo Risanzwe</h3>
              <p className="text-sm text-muted-foreground">
                Koresha amajambo 12 canke 24 yo kugarura irembo ryawe.
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
