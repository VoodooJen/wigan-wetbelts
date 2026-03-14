import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getDowntimeLabel(durationHours: number) {
  if (durationHours <= 3.5) return "Same day turnaround";
  if (durationHours <= 6.5) return "Vehicle needed for up to 1 day";
  if (durationHours <= 13) return "Vehicle needed for 1 to 2 working days";
  return `Vehicle needed for around ${Math.ceil(durationHours / 6.5)} working days`;
}

export function nextWorkingDate(date: Date) {
  let cursor = addDays(date, 1);
  while (cursor.getDay() === 0 || cursor.getDay() === 6) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

export function formatBookingRef(id: string) {
  return `WW-${id.slice(0, 8).toUpperCase()}`;
}

export function toISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}
