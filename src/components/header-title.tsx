
"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

const getTitleFromPath = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Ahabanza';
    if (path.startsWith('/send')) return 'Rungika';
    if (path.startsWith('/receive')) return 'Wakira';
    if (path.startsWith('/buy')) return 'Gura Bitcoin';
    if (path.startsWith('/sell')) return 'Gurisha Bitcoin';
    if (path.startsWith('/orders')) return 'Amatangazo Yanje';
    if (path.startsWith('/transactions')) return 'Ibikorwa';
    if (path.startsWith('/profile')) return 'Profili';
    if (path.startsWith('/settings')) return 'Amagenamiterere';
    return 'Incamake';
}

export function HeaderTitle() {
  const pathname = usePathname();
  const title = useMemo(() => getTitleFromPath(pathname), [pathname]);

  return <h1 className="text-lg font-semibold md:text-xl">{title}</h1>;
}
