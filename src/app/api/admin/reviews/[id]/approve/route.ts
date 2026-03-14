import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  await supabase.from("reviews").update({ is_approved: true }).eq("id", id);

  return NextResponse.redirect(new URL("/admin/reviews", request.url));
}
