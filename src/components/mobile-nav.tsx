
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Receipt,
  Download,
  User,
  Zap,
  Bitcoin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: "/dashboard", icon: Home, label: "Accueil" },
  { path: "/receive", icon: Download, label: "Recevoir" },
  { path: "/orders", icon: Receipt, label: "Commandes" },
  { path: "/profile", icon: User, label: "Profil" },
];

export function MobileNav() {
  const pathname = usePathname();

  const isLightning = pathname.startsWith('/lightning');
  
  const fabAction = {
    href: isLightning ? "/lightning/send" : "/send",
    icon: isLightning ? Zap : Bitcoin,
    label: isLightning ? "Payer" : "Envoyer",
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 h-20 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="relative grid h-full grid-cols-5 items-center">
        {menuItems.slice(0, 2).map((item) => {
          const isActive = pathname.startsWith(item.path) && item.path !== '/' || pathname === item.path;
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

        <div className="relative flex justify-center items-center col-start-3">
          <Link href={fabAction.href} className="absolute bottom-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105">
            <fabAction.icon className="size-7" />
            <span className="sr-only">{fabAction.label}</span>
          </Link>
        </div>

        {menuItems.slice(2).map((item) => {
          const isActive = pathname.startsWith(item.path);
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
