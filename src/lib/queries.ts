import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getVehicleTree = cache(async () => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select("id, make, model, engine, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
});

export const getPublicReviews = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
});

export const getVehicleService = cache(async (vehicleId: string, jobTypeId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vehicle_services")
    .select("*, vehicles(*), job_types(*)")
    .eq("vehicle_id", vehicleId)
    .eq("job_type_id", jobTypeId)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data;
});
