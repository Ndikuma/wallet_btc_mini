"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Download,
  History,
  Home,
  Send,
  Settings,
  User,
  ShoppingCart,
  Receipt,
  Zap,
} from "lucide-react";
import { BitcoinIcon } from "@/components/icons";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { path: "/dashboard", icon: Home, label: "Tableau de bord" },
  { path: "/lightning", icon: Zap, label: "Lightning" },
  { path: "/send", icon: Send, label: "Envoyer" },
  { path: "/receive", icon: Download, label: "Recevoir" },
  { path: "/buy", icon: ShoppingCart, label: "Acheter" },
  { path: "/sell", icon: Receipt, label: "Vendre" },
  { path: "/transactions", icon: History, label: "Transactions" },
  { path: "/orders", icon: ShoppingCart, label: "Commandes" },
];

const footerNavItems = [
    { path: "/profile", icon: User, label: "Profil" },
    { path: "/settings", icon: Settings, label: "Paramètres" },
]

export function MainNav() {
  const pathname = usePathname();

  const isDashboardActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path || pathname === '/';
    }
    return pathname.startsWith(path);
  }

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BitcoinIcon className="size-7" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            Umuhora Tech Wallet
          </h2>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={isDashboardActive(item.path)}
                  tooltip={item.label}
                >
                  <Link href={item.path}>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarSeparator />
         <SidebarGroup>
            <SidebarMenu>
                {footerNavItems.map((item) => (
                     <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.path)}
                        tooltip={item.label}
                        >
                        <Link href={item.path}>
                            <item.icon />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </>
  );
}
