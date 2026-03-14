import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const formData = await request.formData();
  const bookingId = String(formData.get("bookingId") ?? "");
  const customerName = String(formData.get("customerName") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const body = String(formData.get("body") ?? "");

  const supabase = createSupabaseAdminClient();
  await supabase.from("reviews").insert({
    booking_id: bookingId,
    customer_name: customerName,
    rating,
    body,
    is_approved: false
  });

  return NextResponse.redirect(new URL("/reviews?submitted=1", request.url));
}
