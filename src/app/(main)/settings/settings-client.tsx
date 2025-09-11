
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function SettingsClient() {
  const { toast } = useToast();

  const handleBackup = () => {
    toast({
      title: "Backup initiated",
      description: "Your wallet backup file is being generated...",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>
            Choose how values are displayed across the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="currency" className="flex flex-col space-y-1">
              <span>Fiat Currency</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Set your preferred currency for display.
              </span>
            </Label>
            <Select defaultValue="usd">
              <SelectTrigger id="currency" className="w-40">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
                <SelectItem value="jpy">JPY</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-medium">Primary Display Unit</Label>
            <p className="text-sm text-muted-foreground pt-1">Select the main unit for displaying your balance.</p>
            <RadioGroup defaultValue="btc" className="mt-3 grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="btc" id="btc" className="peer sr-only" />
                <Label htmlFor="btc" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  BTC
                </Label>
              </div>
               <div>
                <RadioGroupItem value="sats" id="sats" className="peer sr-only" />
                <Label htmlFor="sats" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  Sats
                </Label>
              </div>
               <div>
                <RadioGroupItem value="usd" id="usd" className="peer sr-only" />
                <Label htmlFor="usd" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover-text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  USD
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Enhance the security of your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="2fa" className="flex flex-col space-y-1">
              <span>Two-Factor Authentication (2FA)</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Add an extra layer of security to your wallet.
              </span>
            </Label>
            <Switch id="2fa" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Backup or restore your wallet data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span>Backup Wallet</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Download a secure backup of your wallet.
              </span>
            </div>
            <Button onClick={handleBackup}>Backup Now</Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span>Restore Wallet</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Restore your wallet from a backup file.
              </span>
            </div>
            <Button variant="outline">Restore</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
