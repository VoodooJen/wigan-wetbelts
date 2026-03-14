import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { UpdateForm } from "@/components/admin/update-form";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";

export default async function AdminBookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      *,
      customers(*),
      booking_allocations(*),
      booking_updates(*),
      booking_media(*)
      `
    )
    .eq("id", id)
    .single();

  if (!booking) notFound();

  return (
    <AdminShell title={`Booking ${booking.id.slice(0, 8)}`}>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6">
          <div className="panel p-6">
            <p className="text-sm subtle">Status</p>
            <p className="mt-2 text-2xl font-semibold capitalize">{booking.status.replaceAll("_", " ")}</p>
            <p className="mt-5 text-sm subtle">Payment status</p>
            <p className="mt-1 text-lg font-medium capitalize">{booking.payment_status.replaceAll("_", " ")}</p>
            <p className="mt-5 text-sm subtle">Total price</p>
            <p className="mt-1">{formatMoney(booking.price_gbp)}</p>
            <p className="mt-5 text-sm subtle">Booking fee paid</p>
            <p className="mt-1">{formatMoney(booking.booking_fee_paid_gbp)}</p>
            <p className="mt-5 text-sm subtle">Balance due</p>
            <p className="mt-1">{formatMoney(booking.remaining_balance_gbp)}</p>
            <p className="mt-5 text-sm subtle">Tracking token</p>
            <p className="mt-1 break-all text-sm">{booking.tracking_token}</p>
          </div>

          <div className="panel p-6">
            <h2 className="text-xl font-semibold">Allocations</h2>
            <div className="mt-4 grid gap-3">
              {(booking.booking_allocations ?? []).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="font-medium">{item.allocation_date}</p>
                  <p className="text-sm subtle">{item.hours_allocated} hours</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <UpdateForm bookingId={booking.id} />
          <MediaUploadForm bookingId={booking.id} />

          <div className="panel p-6">
            <h2 className="text-xl font-semibold">Existing updates</h2>
            <div className="mt-4 grid gap-3">
              {(booking.booking_updates ?? []).map((update) => (
                <div key={update.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="font-medium">{update.title}</p>
                  <p className="mt-1 text-sm subtle">{update.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
