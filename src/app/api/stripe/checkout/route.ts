import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateAllocations } from "@/lib/booking-engine";
import { getBookingHoldExpiry } from "@/lib/booking-holds";
import { getServerEnv } from "@/lib/env";
import { getBookingFeeAmount, getRemainingBalanceAmount } from "@/lib/payment";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const schema = z.object({
  vehicleServiceId: z.string().uuid(),
  preferredStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredStartTime: z.string().regex(/^\d{2}:\d{2}$/)
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: vehicleService } = await supabase
    .from("vehicle_services")
    .select("id, vehicle_id, job_type_id, price_gbp, duration_hours, downtime_label, vehicles(make, model, engine), job_types(name)")
    .eq("id", parsed.data.vehicleServiceId)
    .single();

  if (!vehicleService) {
    return NextResponse.json({ error: "Vehicle service not found" }, { status: 404 });
  }

  const allocations = await calculateAllocations(
    parsed.data.preferredStartDate,
    vehicleService.duration_hours,
    parsed.data.preferredStartTime
  );

  if (!allocations) {
    return NextResponse.json({ error: "Selected slot is no longer available" }, { status: 409 });
  }

  const stripe = getStripe();
  const env = getServerEnv();
  const adminSupabase = createSupabaseAdminClient();
  const totalPriceGbp = Number(vehicleService.price_gbp);
  const bookingFeeGbp = getBookingFeeAmount(totalPriceGbp);
  const remainingBalanceGbp = getRemainingBalanceAmount(totalPriceGbp, bookingFeeGbp);
  const { data: hold, error: holdError } = await adminSupabase
    .from("booking_holds")
    .insert({
      vehicle_service_id: vehicleService.id,
      preferred_start_date: parsed.data.preferredStartDate,
      preferred_start_time: parsed.data.preferredStartTime,
      allocations_json: allocations.allocations,
      expires_at: getBookingHoldExpiry(),
      status: "active"
    })
    .select("id")
    .single();

  if (holdError || !hold) {
    return NextResponse.json({ error: "Unable to reserve the selected slot" }, { status: 409 });
  }

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${env.appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.appUrl}/booking/cancelled`,
      customer_creation: "always",
      billing_address_collection: "required",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(bookingFeeGbp * 100),
            product_data: {
              name: `${vehicleService.vehicles?.make} ${vehicleService.vehicles?.model} ${vehicleService.job_types?.name} booking fee`,
              description: `${vehicleService.vehicles?.engine} - ${vehicleService.downtime_label}. The booking fee is deducted from the final bill.`
            }
          }
        }
      ],
      metadata: {
        holdId: hold.id,
        vehicleServiceId: vehicleService.id,
        vehicleId: vehicleService.vehicle_id,
        jobTypeId: vehicleService.job_type_id,
        preferredStartDate: parsed.data.preferredStartDate,
        preferredStartTime: parsed.data.preferredStartTime,
        totalPriceGbp: String(totalPriceGbp),
        bookingFeePaidGbp: String(bookingFeeGbp),
        remainingBalanceGbp: String(remainingBalanceGbp),
        allocationsJson: JSON.stringify(allocations.allocations)
      }
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    await adminSupabase.from("booking_holds").update({ status: "cancelled" }).eq("id", hold.id);
    throw error;
  }
}
