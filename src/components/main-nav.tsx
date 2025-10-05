
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Download,
  History,
  Home,
  Bitcoin,
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
import React from "react";


const mainNavItems = [
    { path: "/buy", icon: ShoppingCart, label: "Acheter" },
    { path: "/sell", icon: Receipt, label: "Vendre" },
    { path: "/orders", icon: History, label: "Commandes" },
];

const footerNavItems = [
    { path: "/profile", icon: User, label: "Profil" },
    { path: "/settings", icon: Settings, label: "Paramètres" },
]

export function MainNav() {
  const pathname = usePathname();

  const isRouteActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return pathname === path;
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
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isRouteActive("/dashboard", true)}
                        tooltip={"On-chain"}
                    >
                        <Link href="/dashboard">
                            <Bitcoin />
                            <span className="group-data-[collapsible=icon]:hidden">On-chain</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isRouteActive("/lightning")}
                        tooltip={"Lightning"}
                    >
                        <Link href="/lightning">
                            <Zap />
                            <span className="group-data-[collapsible=icon]:hidden">Lightning</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
        
        <SidebarSeparator />

        <SidebarGroup>
            <SidebarMenu>
                {mainNavItems.map((item) => (
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
