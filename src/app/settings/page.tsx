
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsClient } from "./settings-client";
import MainLayout from "@/app/main-layout";

function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">
          Manage your wallet settings and preferences.
        </p>
      </div>
      <SettingsClient />
    </div>
  );
}

export default function SettingsLayout() {
    return (
        <MainLayout>
            <SettingsPage />
        </MainLayout>
    )
}
