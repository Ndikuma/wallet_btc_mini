
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const shortenText = (text: string | null | undefined, start = 8, end = 8) => {
  if (!text) return 'une adresse externe';
  if (text.length <= start + end) return text;
  return `${text.substring(0, start)}...${text.substring(text.length - end)}`;
}

export const getFiat = (val: number | null | undefined, currency: string) => {
  if (val === null || val === undefined) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency.toUpperCase() }).format(0);
  }
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency.toUpperCase() }).format(val);
}
