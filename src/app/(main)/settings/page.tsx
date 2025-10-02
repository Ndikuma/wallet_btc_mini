
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsClient } from "./settings-client";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Amagenamiterere</h1>
        <p className="text-muted-foreground">
          Genamika amagenamiterere n'ivyo ukunda mu irembo ryawe.
        </p>
      </div>
      <SettingsClient />
    </div>
  );
}
