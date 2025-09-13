import type { SVGProps } from "react"

export function BitcoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      role="img" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 17.58c-2.13 0-4.01-.99-5.1-2.58l1.37-1.02c.73.99 1.93 1.6 3.73 1.6 1.73 0 2.93-.53 2.93-1.44 0-.8-.93-1.2-2.3-1.73l-1.04-.37c-1.93-.73-3.23-1.68-3.23-3.72 0-1.85 1.4-3.28 3.65-3.58V3.25h2.18v2.08c1.13.2 2.02.77 2.62 1.45l-1.3 1.05c-.48-.6-1.23-.97-2.32-.97-1.42 0-2.37.5-2.37 1.3 0 .73.78 1.12 2.05 1.6l1.04.37c2.3.88 3.5 1.93 3.5 4.08 0 2.5-1.93 3.9-4.7 3.9z"/>
    </svg>
  )
}

export function ScanIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}
