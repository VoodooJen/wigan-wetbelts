import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ReviewSubmissionPage({
  params
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: booking } = await supabase.from("bookings").select("id, status").eq("id", bookingId).single();

  if (!booking || booking.status !== "completed") notFound();

  return (
    <section className="container-shell py-12">
      <form action="/api/reviews" method="POST" className="panel mx-auto max-w-2xl p-8">
        <h1 className="text-3xl font-semibold">Leave a review</h1>
        <input type="hidden" name="bookingId" value={bookingId} />
        <div className="mt-6 grid gap-4">
          <input className="field" name="customerName" placeholder="Your name" required />
          <select className="field" name="rating" required defaultValue="">
            <option value="" disabled>
              Choose rating
            </option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
          <textarea className="field min-h-32" name="body" placeholder="Your review" required />
          <button className="btn-primary">Submit review</button>
        </div>
      </form>
    </section>
  );
}
