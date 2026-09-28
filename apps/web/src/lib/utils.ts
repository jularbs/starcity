import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toZonedTime, format } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function showPHdate(date: string) {
  const adjusted = toZonedTime(date, 'Asia/Manila');
  return format(adjusted, 'MMMM dd, yyyy');
}

export function getImageSource(media: {
  key?: string;
  bucket?: string;
  location?: string;
}): string {
  if (media?.key && media?.bucket) {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/media?key=${media.key}&bucket=${media.bucket}`;
  }

  //Ride model doesnt have bucket
  if (media?.key) {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/media?key=${media.key}`;
  }

  return media.location!;
}
