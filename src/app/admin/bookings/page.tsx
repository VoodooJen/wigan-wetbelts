import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";

export default async function AdminBookingsPage() {
  const { supabase } = await requireAdmin();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_date, status, payment_status, price_gbp, booking_fee_paid_gbp, remaining_balance_gbp, downtime_label")
    .order("created_at", { ascending: false });

  return (
    <AdminShell title="Bookings">
      <div className="panel overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total price</th>
              <th className="px-4 py-3">Booking fee paid</th>
              <th className="px-4 py-3">Balance due</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(bookings ?? []).map((booking) => (
              <tr key={booking.id} className="border-t border-white/8">
                <td className="px-4 py-3">{booking.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{booking.booking_date}</td>
                <td className="px-4 py-3 capitalize">{booking.status.replaceAll("_", " ")}</td>
                <td className="px-4 py-3 capitalize">{booking.payment_status.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">{formatMoney(booking.price_gbp)}</td>
                <td className="px-4 py-3">{formatMoney(booking.booking_fee_paid_gbp)}</td>
                <td className="px-4 py-3">{formatMoney(booking.remaining_balance_gbp)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/bookings/${booking.id}`} className="text-cyan-300">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
