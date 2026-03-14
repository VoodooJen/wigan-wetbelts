import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminServicesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("vehicle_services")
    .select("id, price_gbp, downtime_label, is_active, vehicles(make, model, engine), job_types(name)")
    .order("created_at", { ascending: false });

  return (
    <AdminShell title="Services manager">
      <div className="grid gap-4">
        {(data ?? []).map((service) => (
          <div key={service.id} className="panel p-6">
            <p className="font-medium">
              {service.vehicles?.make} {service.vehicles?.model} {service.vehicles?.engine}
            </p>
            <p className="mt-1 text-sm subtle">{service.job_types?.name}</p>
            <p className="mt-3 text-sm">£{service.price_gbp}</p>
            <p className="text-sm subtle">{service.downtime_label}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
