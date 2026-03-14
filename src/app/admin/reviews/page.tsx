import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminReviewsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });

  return (
    <AdminShell title="Reviews manager">
      <div className="grid gap-4">
        {(data ?? []).map((review) => (
          <div key={review.id} className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{review.customer_name}</p>
                <p className="text-sm subtle">{review.rating} / 5</p>
              </div>
              <form action={`/api/admin/reviews/${review.id}/approve`} method="POST">
                <button className="btn-secondary">{review.is_approved ? "Approved" : "Approve"}</button>
              </form>
            </div>
            <p className="mt-4 text-sm subtle">{review.body}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
