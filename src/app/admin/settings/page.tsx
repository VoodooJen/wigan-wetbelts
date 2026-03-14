import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("business_settings").select("*").limit(1).maybeSingle();

  return (
    <AdminShell title="Settings">
      <div className="panel p-6">
        <p className="text-sm subtle">Workshop daily capacity</p>
        <p className="mt-2 text-2xl font-semibold">{data?.workshop_daily_capacity_hours ?? 6.5} hours</p>
        <p className="mt-4 text-sm subtle">This starter reads settings from Supabase. Add a server action here to save changes.</p>
      </div>
    </AdminShell>
  );
}
