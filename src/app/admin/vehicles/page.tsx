import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminVehiclesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("vehicles").select("*").order("sort_order", { ascending: true });

  return (
    <AdminShell title="Vehicles manager">
      <div className="panel overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left">Make</th>
              <th className="px-4 py-3 text-left">Model</th>
              <th className="px-4 py-3 text-left">Engine</th>
              <th className="px-4 py-3 text-left">Active</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-white/8">
                <td className="px-4 py-3">{row.make}</td>
                <td className="px-4 py-3">{row.model}</td>
                <td className="px-4 py-3">{row.engine}</td>
                <td className="px-4 py-3">{row.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
