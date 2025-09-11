"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    path: "/send",
    icon: ArrowUpRight,
    label: "Send",
  },
  {
    path: "/receive",
    icon: ArrowDownLeft,
    label: "Receive",
  },
  {
    path: "/transactions",
    icon: History,
    label: "History",
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="grid h-16 grid-cols-4 items-center">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
              pathname.startsWith(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="size-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
