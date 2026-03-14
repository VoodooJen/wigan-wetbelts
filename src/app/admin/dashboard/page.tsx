import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [{ count: bookingCount }, { count: reviewPending }, { count: activeVehicles }] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("is_approved", false),
    supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("is_active", true)
  ]);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-6">
          <p className="text-sm subtle">Bookings</p>
          <p className="mt-2 text-3xl font-semibold">{bookingCount ?? 0}</p>
        </div>
        <div className="panel p-6">
          <p className="text-sm subtle">Pending reviews</p>
          <p className="mt-2 text-3xl font-semibold">{reviewPending ?? 0}</p>
        </div>
        <div className="panel p-6">
          <p className="text-sm subtle">Active vehicles</p>
          <p className="mt-2 text-3xl font-semibold">{activeVehicles ?? 0}</p>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-xl font-semibold">Quick links</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/calendar" className="btn-secondary">
            Open calendar
          </Link>
          <Link href="/admin/bookings" className="btn-secondary">
            View bookings
          </Link>
          <Link href="/admin/reviews" className="btn-secondary">
            Moderate reviews
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
