
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
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.32 17.653h-1.92V6.347h1.92v2.45h.334c.41 0 .82-.08 1.23-.24l.24-.093v-2.45h1.92v6.307h-1.92v-2.45h-.334c-.41 0-.82.08-1.23.24l-.24.093v2.45zm5.728-3.414c0 .8-.24 1.44-.72 1.92s-1.114.72-1.894.72c-.78 0-1.414-.24-1.894-.72s-.72-1.12-.72-1.92v-1.92c0-.8.24-1.44.72-1.92s1.114-.72 1.894-.72c.78 0 1.414.24 1.894.72s.72 1.12.72 1.92v1.92zm-1.92-1.92c0-.4-.093-.72-.28-.96s-.44-.36-.76-.36c-.32 0-.573.12-.76.36s-.28.56-.28.96v1.92c0 .4.093.72.28.96s.44.36.76.36c.32 0 .573-.12.76-.36s-.28-.56-.28-.96v-1.92z"/>
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

