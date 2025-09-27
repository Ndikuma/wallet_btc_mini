
"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

const getTitleFromPath = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/send')) return 'Send';
    if (path.startsWith('/receive')) return 'Receive';
    if (path.startsWith('/buy')) return 'Buy Bitcoin';
    if (path.startsWith('/orders')) return 'My Orders';
    if (path.startsWith('/transactions')) return 'Transactions';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Overview';
}

export function HeaderTitle() {
  const pathname = usePathname();
  const title = useMemo(() => getTitleFromPath(pathname), [pathname]);

  return <h1 className="text-lg font-semibold md:text-xl">{title}</h1>;
}
