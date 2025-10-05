
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
  ChevronDown,
  FileText,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import React from "react";

const onChainSubNavItems = [
    { path: "/dashboard", icon: Home, label: "Tableau de bord" },
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

  const isRouteActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return pathname === path;
    }
    if (path === '/dashboard') {
        // Only active for /dashboard, not for other on-chain routes
        return pathname === path;
    }
    return pathname.startsWith(path);
  }
  
  const isOnChainSectionActive = onChainSubNavItems.some(item => pathname.startsWith(item.path));
  const [isOnChainOpen, setIsOnChainOpen] = React.useState(isOnChainSectionActive);

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
            <Collapsible open={isOnChainOpen} onOpenChange={setIsOnChainOpen}>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isOnChainSectionActive}
                            tooltip={"On-Chain"}
                        >
                             <Link href="/dashboard" className="w-full justify-between">
                                <div className="flex items-center gap-2">
                                    <Home />
                                    <span className="group-data-[collapsible=icon]:hidden">On-Chain</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                         <CollapsibleTrigger asChild>
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 group-data-[collapsible=icon]:hidden p-1 rounded-md hover:bg-sidebar-accent">
                                <ChevronDown className={cn("size-4 transition-transform", isOnChainOpen && "rotate-180")} />
                            </button>
                        </CollapsibleTrigger>
                    </SidebarMenuItem>
                </SidebarMenu>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {onChainSubNavItems.map((item) => (
                            <SidebarMenuSubItem key={item.path}>
                                <SidebarMenuSubButton asChild isActive={isRouteActive(item.path, item.path === '/dashboard')}>
                                    <Link href={item.path}>
                                        <item.icon className="mr-2" />
                                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isRouteActive("/lightning")}
                        tooltip={"Lightning"}
                    >
                        <Link href="/lightning" className="w-full justify-between">
                            <div className="flex items-center gap-2">
                                <Zap />
                                <span className="group-data-[collapsible=icon]:hidden">Lightning</span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
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
