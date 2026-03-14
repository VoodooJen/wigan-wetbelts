import { addMinutes } from "date-fns";

export const BOOKING_HOLD_MINUTES = 10;

export function getBookingHoldExpiry() {
  return addMinutes(new Date(), BOOKING_HOLD_MINUTES).toISOString();
}
