export const BOOKING_FEE_GBP = 50;

export type PaymentStatus =
  | "pending"
  | "booking_fee_paid"
  | "fully_paid"
  | "refunded"
  | "cancelled";

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

export function getBookingFeeAmount(totalPriceGbp: number) {
  return roundMoney(Math.min(Math.max(totalPriceGbp, 0), BOOKING_FEE_GBP));
}

export function getRemainingBalanceAmount(totalPriceGbp: number, bookingFeePaidGbp = getBookingFeeAmount(totalPriceGbp)) {
  return roundMoney(Math.max(totalPriceGbp - bookingFeePaidGbp, 0));
}
