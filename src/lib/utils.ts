import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { utcToZonedTime, format } from "date-fns-tz";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function showPHdate(date: string) {
  const adjusted = utcToZonedTime(date, "Asia/Manila");
  return format(adjusted, "MMMM dd, yyyy");
}
