import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableStartSlots } from "@/lib/booking-engine";
import { getBookingFeeAmount, getRemainingBalanceAmount } from "@/lib/payment";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  vehicleId: z.string().uuid(),
  jobTypeId: z.string().uuid()
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: vehicleService, error } = await supabase
    .from("vehicle_services")
    .select("id, vehicle_id, job_type_id, price_gbp, duration_hours, downtime_label")
    .eq("vehicle_id", parsed.data.vehicleId)
    .eq("job_type_id", parsed.data.jobTypeId)
    .eq("is_active", true)
    .single();

  if (error || !vehicleService) {
    return NextResponse.json({ error: "Service not found for this vehicle" }, { status: 404 });
  }

  const today = new Date();
  const startISO = today.toISOString().slice(0, 10);
  const availableSlots = await getAvailableStartSlots(vehicleService.duration_hours, startISO);
  const totalPriceGbp = Number(vehicleService.price_gbp);
  const bookingFeeGbp = getBookingFeeAmount(totalPriceGbp);
  const remainingBalanceGbp = getRemainingBalanceAmount(totalPriceGbp, bookingFeeGbp);

  return NextResponse.json({
    vehicleServiceId: vehicleService.id,
    vehicleId: vehicleService.vehicle_id,
    jobTypeId: vehicleService.job_type_id,
    priceGbp: totalPriceGbp,
    bookingFeeGbp,
    remainingBalanceGbp,
    downtimeLabel: vehicleService.downtime_label,
    availableSlots
  });
}
