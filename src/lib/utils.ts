import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TZDate } from "@date-fns/tz";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function showCurrency(number: number): string {
  return `₱${number.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function UTCtoPH(date: Date): Date {
  const phTime = new TZDate(date, "Asia/Manila");

  return phTime;
}

export function obscureEmail(email: string): string {
  const [name, domain] = email.split("@");
  return `${name[0]}${name[1]}${new Array(name.length - 2).join("*")}${
    name[name.length - 1]
  }${domain ? `@${domain}` : ""}`;
}
