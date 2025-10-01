
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
  Receipt
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
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { path: "/dashboard", icon: Home, label: "Dashboard" },
  { path: "/send", icon: Send, label: "Send" },
  { path: "/receive", icon: Download, label: "Receive" },
  { path: "/buy", icon: ShoppingCart, label: "Buy" },
  { path: "/sell", icon: Receipt, label: "Sell" },
  { path: "/transactions", icon: History, label: "Transactions" },
  { path: "/orders", icon: ShoppingCart, label: "Orders" },
];

const footerNavItems = [
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/settings", icon: Settings, label: "Settings" },
]

export function MainNav() {
  const pathname = usePathname();

  const isDashboardActive = (path: string) => {
    if (path === '/dashboard') {
      // The main page for the layout is the dashboard.
      // It's active if the path is exactly '/dashboard' or if it's the root of the app view ('/')
      // Next.js will resolve `/` inside the group to the group's page.tsx
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
