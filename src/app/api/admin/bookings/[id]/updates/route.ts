import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  isCustomerVisible: z.boolean()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase } = await requireAdmin();
  const { id } = await params;
  const json = await request.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await supabase.from("booking_updates").insert({
    booking_id: id,
    title: parsed.data.title,
    body: parsed.data.body,
    is_customer_visible: parsed.data.isCustomerVisible,
    created_by: user.id
  });

  return NextResponse.json({ ok: true });
}
