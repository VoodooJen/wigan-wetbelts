import { BookingForm } from "@/components/public/booking-form";
import { Pill, Section } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function BookPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: vehicles }, { data: jobTypes }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, make, model, engine")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("job_types").select("id, name").eq("is_active", true).order("name")
  ]);

  return (
    <Section className="pb-16 pt-10 md:pt-14 md:pb-20">
      <div className="max-w-3xl">
        <Pill>Book online</Pill>
        <h1 className="page-title mt-5">Choose your vehicle and secure your appointment</h1>
        <p className="mt-5 text-base leading-8 subtle md:text-lg">
          Select your vehicle, choose your service, review your price, and book from the available workshop slots.
        </p>
        <p className="mt-3 text-sm subtle">The £50 booking fee will be deducted from your final bill.</p>
      </div>

      <div className="mt-10">
        <BookingForm vehicles={vehicles ?? []} jobTypes={jobTypes ?? []} />
      </div>
    </Section>
  );
}
