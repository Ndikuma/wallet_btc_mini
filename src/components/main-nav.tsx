"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Download,
  History,
  LayoutDashboard,
  Send,
  Settings,
  User
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
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/send", icon: Send, label: "Send" },
  { path: "/receive", icon: Download, label: "Receive" },
  { path: "/transactions", icon: History, label: "Transactions" },
];

const footerNavItems = [
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/settings", icon: Settings, label: "Settings" },
]

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BitcoinIcon className="size-8 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            mini wallet
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
