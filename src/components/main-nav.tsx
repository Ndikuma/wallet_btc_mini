"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  LayoutDashboard,
  Settings,
  CandlestickChart,
  Wallet,
  Coins,
  ArrowRightLeft,
  HelpCircle
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

const overviewItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { path: "/assets", icon: Wallet, label: "Assets" },
  { path: "/markets", icon: CandlestickChart, label: "Markets" },
];

const tradeItems = [
  { path: "/convert", icon: Coins, label: "Convert" },
  { path: "/send", icon: ArrowUpRight, label: "Send" },
  { path: "/receive", icon: ArrowDownLeft, label: "Deposit" },
  { path: "/exchange", icon: ArrowRightLeft, label: "Exchange" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BitcoinIcon className="size-8 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            finvest
          </h2>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>OVERVIEW</SidebarGroupLabel>
          <SidebarMenu>
            {overviewItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.path)}
                  tooltip={item.label}
                >
                  <Link href={item.path}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>TRADE</SidebarGroupLabel>
          <SidebarMenu>
            {tradeItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.path)}
                  tooltip={item.label}
                >
                  <Link href={item.path}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  variant="outline"
                  className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  isActive={pathname.startsWith("/transactions")}
                  tooltip="Withdraw"
                >
                  <Link href="/transactions">
                    <History />
                    <span>Withdraw</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarSeparator />
         <SidebarGroup>
            <SidebarGroupLabel>REFERENCES</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/settings")}
                    tooltip="Settings"
                    >
                    <Link href="/settings">
                        <Settings />
                        <span>Settings</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/help")}
                    tooltip="Help Center"
                    >
                    <Link href="/help">
                        <HelpCircle />
                        <span>Help Center</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </>
  );
}
