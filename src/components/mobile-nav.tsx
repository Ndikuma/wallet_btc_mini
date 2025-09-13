
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Download,
  History,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScanIcon } from "@/components/icons";

const menuItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/receive", icon: Download, label: "Receive" },
  { path: "/send", icon: ScanIcon, label: "Scan" }, // Special item for the center button
  { path: "/transactions", icon: History, label: "History" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 h-20 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="relative grid h-full grid-cols-5 items-center">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);

          if (item.label === "Scan") {
            return (
              <div key={item.path} className="relative flex justify-center items-center col-start-3">
                 <Link href={item.path} className="absolute bottom-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105">
                    <item.icon className="size-8" />
                    <span className="sr-only">{item.label}</span>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
