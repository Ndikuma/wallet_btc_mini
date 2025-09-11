import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can add page title here if needed */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 pb-20 md:p-6">{children}</main>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
