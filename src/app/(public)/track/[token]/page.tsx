import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TrackingPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      *,
      vehicle_services(*),
      booking_updates(*),
      booking_media(*)
      `
    )
    .eq("tracking_token", token)
    .single();

  if (!booking) notFound();

  return (
    <section className="container-shell py-12 md:py-16">
      <div className="mb-8">
        <span className="badge">Booking tracker</span>
        <h1 className="page-title mt-4">Your workshop progress</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="panel p-6">
          <p className="text-sm subtle">Status</p>
          <p className="mt-2 text-2xl font-semibold capitalize">{booking.status.replaceAll("_", " ")}</p>
          <p className="mt-5 text-sm subtle">Downtime</p>
          <p className="mt-1">{booking.downtime_label}</p>
          <p className="mt-5 text-sm subtle">Booking date</p>
          <p className="mt-1">{booking.booking_date}</p>
        </div>

        <div className="grid gap-4">
          <div className="panel p-6">
            <h2 className="text-xl font-semibold">Updates</h2>
            <div className="mt-4 grid gap-4">
              {(booking.booking_updates ?? [])
                .filter((item) => item.is_customer_visible)
                .map((update) => (
                  <article key={update.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="font-medium">{update.title}</p>
                    <p className="mt-2 text-sm subtle">{update.body}</p>
                  </article>
                ))}
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="text-xl font-semibold">Media</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {(booking.booking_media ?? [])
                .filter((item) => item.is_customer_visible)
                .map((media) => (
                  <article key={media.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-sm font-medium">{media.caption ?? "Workshop upload"}</p>
                    <p className="mt-2 break-all text-xs subtle">{media.storage_path}</p>
                  </article>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
