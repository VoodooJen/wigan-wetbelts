import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";
import { getBookingFeeAmount, getRemainingBalanceAmount } from "@/lib/payment";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { getDowntimeLabel } from "@/lib/utils";

type HoldAllocation = {
  allocationDate: string;
  hoursAllocated: number;
  sequenceNo: number;
};

type BookingHoldRow = {
  id: string;
  preferred_start_date: string;
  preferred_start_time: string;
  allocations_json: unknown;
  status: "active" | "converted" | "expired" | "cancelled";
};

function isHoldAllocation(value: unknown): value is HoldAllocation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HoldAllocation>;
  const hoursAllocated = Number(candidate.hoursAllocated);
  const sequenceNo = Number(candidate.sequenceNo);

  return (
    typeof candidate.allocationDate === "string" &&
    Number.isFinite(hoursAllocated) &&
    Number.isFinite(sequenceNo)
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, getServerEnv().stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata ?? {};
    const supabase = createSupabaseAdminClient();

    const holdId = metadata.holdId;
    const vehicleServiceId = metadata.vehicleServiceId;
    const vehicleId = metadata.vehicleId;
    const jobTypeId = metadata.jobTypeId;
    const preferredStartDate = metadata.preferredStartDate;
    const preferredStartTime = metadata.preferredStartTime;
    const allocationsJson = metadata.allocationsJson;

    if (!vehicleServiceId || !vehicleId || !jobTypeId || !preferredStartDate || !allocationsJson) {
      return NextResponse.json({ received: true });
    }

    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ received: true });
    }

    const { data: hold } = holdId
      ? await supabase
          .from("booking_holds")
          .select("id, preferred_start_date, preferred_start_time, allocations_json, status")
          .eq("id", holdId)
          .maybeSingle()
      : { data: null };

    const bookingHold = (hold ?? null) as BookingHoldRow | null;

    if (bookingHold?.status === "converted") {
      return NextResponse.json({ received: true });
    }

    if (bookingHold?.status === "cancelled") {
      return NextResponse.json({ error: "Booking hold cancelled" }, { status: 409 });
    }

    const { data: vehicleService } = await supabase
      .from("vehicle_services")
      .select("price_gbp, duration_hours, downtime_label")
      .eq("id", vehicleServiceId)
      .single();

    if (!vehicleService) {
      return NextResponse.json({ error: "Vehicle service missing" }, { status: 404 });
    }

    const customerDetails = session.customer_details;
    const fullName = customerDetails?.name?.trim() || "Customer";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ") || "";
    const totalPriceGbp = Number(metadata.totalPriceGbp ?? vehicleService.price_gbp);
    const bookingFeePaidGbp = Number(metadata.bookingFeePaidGbp ?? getBookingFeeAmount(totalPriceGbp));
    const remainingBalanceGbp = Number(
      metadata.remainingBalanceGbp ?? getRemainingBalanceAmount(totalPriceGbp, bookingFeePaidGbp)
    );
    const bookingStartDate = bookingHold?.preferred_start_date ?? preferredStartDate;
    const bookingStartTime = bookingHold?.preferred_start_time ?? preferredStartTime ?? null;

    const { data: customer } = await supabase
      .from("customers")
      .insert({
        email: customerDetails?.email ?? `unknown+${session.id}@example.com`,
        first_name: firstName,
        last_name: lastName,
        phone: customerDetails?.phone ?? null
      })
      .select()
      .single();

    if (!customer) {
      return NextResponse.json({ error: "Customer insert failed" }, { status: 500 });
    }

    const trackingToken = crypto.randomBytes(18).toString("hex");

    const { data: booking } = await supabase
      .from("bookings")
      .insert({
        customer_id: customer.id,
        vehicle_service_id: vehicleServiceId,
        vehicle_id: vehicleId,
        job_type_id: jobTypeId,
        booking_date: bookingStartDate,
        preferred_start_time: bookingStartTime,
        status: "confirmed",
        price_gbp: totalPriceGbp,
        booking_fee_paid_gbp: bookingFeePaidGbp,
        remaining_balance_gbp: remainingBalanceGbp,
        payment_status: "booking_fee_paid",
        duration_hours: vehicleService.duration_hours,
        downtime_label: vehicleService.downtime_label ?? getDowntimeLabel(vehicleService.duration_hours),
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: String(session.payment_intent ?? ""),
        tracking_token: trackingToken
      })
      .select()
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking insert failed" }, { status: 500 });
    }

    const parsedAllocations = bookingHold?.allocations_json ?? JSON.parse(allocationsJson);
    const allocations = Array.isArray(parsedAllocations) ? parsedAllocations.filter(isHoldAllocation) : [];

    await supabase.from("booking_allocations").insert(
      allocations.map((allocation) => ({
        booking_id: booking.id,
        allocation_date: allocation.allocationDate,
        hours_allocated: Number(allocation.hoursAllocated),
        sequence_no: Number(allocation.sequenceNo)
      }))
    );

    if (bookingHold) {
      await supabase.from("booking_holds").update({ status: "converted" }).eq("id", bookingHold.id);
    }

    await supabase.from("booking_updates").insert({
      booking_id: booking.id,
      title: "Booking confirmed",
      body: bookingStartTime
        ? `Your booking fee has been received and your booking is scheduled for ${bookingStartDate} at ${bookingStartTime}. The £50 booking fee will be deducted from your final bill.`
        : "Your booking fee has been received and your booking has been added to the workshop schedule. The £50 booking fee will be deducted from your final bill.",
      is_customer_visible: true
    });
  }

  return NextResponse.json({ received: true });
}
