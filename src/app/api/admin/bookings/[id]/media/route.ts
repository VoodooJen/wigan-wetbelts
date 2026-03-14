import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const formData = await request.formData();

  const file = formData.get("file");
  const caption = String(formData.get("caption") ?? "");
  const isCustomerVisible = String(formData.get("isCustomerVisible") ?? "true") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const extension = file.name.split(".").pop() ?? "bin";
  const path = `${id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("booking-media")
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  await supabase.from("booking_media").insert({
    booking_id: id,
    storage_path: path,
    media_type: file.type.startsWith("video/") ? "video" : "image",
    caption,
    is_customer_visible: isCustomerVisible,
    created_by: user.id
  });

  return NextResponse.json({ ok: true });
}
