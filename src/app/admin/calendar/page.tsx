import Link from "next/link";
import {
  addDays,
  endOfWeek,
  format,
  parseISO,
  startOfToday,
  startOfWeek,
  subWeeks,
  addWeeks
} from "date-fns";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";

type CalendarSearchParams = {
  week?: string;
};

type BusinessSettingsRow = {
  workshop_daily_capacity_hours?: number | string | null;
  working_days?: number[] | null;
};

type CalendarCustomer = {
  first_name: string;
  last_name: string;
} | null;

type CalendarVehicle = {
  make: string;
  model: string;
  engine: string;
} | null;

type CalendarAllocationRow = {
  id: string;
  allocation_date: string;
  hours_allocated: number;
  booking_id: string;
  bookings: {
    id: string;
    preferred_start_time: string | null;
    status: string;
    remaining_balance_gbp: number;
    customers: CalendarCustomer;
    vehicles: CalendarVehicle;
    job_types: {
      name: string;
    } | null;
  } | null;
};

const DEFAULT_DAILY_CAPACITY = 6.5;
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5];

function toISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function parseWeekStart(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return startOfWeek(startOfToday(), { weekStartsOn: 1 });
  }

  const parsed = parseISO(value);

  if (Number.isNaN(parsed.getTime())) {
    return startOfWeek(startOfToday(), { weekStartsOn: 1 });
  }

  return startOfWeek(parsed, { weekStartsOn: 1 });
}

function formatCustomerName(customer: CalendarCustomer) {
  if (!customer) {
    return "Customer";
  }

  return `${customer.first_name} ${customer.last_name}`.trim();
}

function formatVehicle(vehicle: CalendarVehicle) {
  if (!vehicle) {
    return "Vehicle details unavailable";
  }

  return `${vehicle.make} ${vehicle.model} ${vehicle.engine}`;
}

function formatStartTime(value: string | null) {
  return value ?? "Time not set";
}

function getStatusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "border-cyan-400/30 bg-cyan-400/10 text-cyan-200";
    case "in_progress":
      return "border-amber-400/30 bg-amber-400/10 text-amber-200";
    case "waiting_parts":
      return "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200";
    case "completed":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
    case "cancelled":
      return "border-rose-400/30 bg-rose-400/10 text-rose-200";
    default:
      return "border-white/10 bg-white/5 text-white";
  }
}

export default async function AdminCalendarPage({
  searchParams
}: {
  searchParams?: Promise<CalendarSearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const weekStart = parseWeekStart(resolvedSearchParams.week);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const { supabase } = await requireAdmin();

  const [{ data: settings }, { data: allocations }] = await Promise.all([
    supabase.from("business_settings").select("*").limit(1).maybeSingle(),
    supabase
      .from("booking_allocations")
      .select(
        `
        id,
        allocation_date,
        hours_allocated,
        booking_id,
        bookings (
          id,
          preferred_start_time,
          status,
          remaining_balance_gbp,
          customers (
            first_name,
            last_name
          ),
          vehicles (
            make,
            model,
            engine
          ),
          job_types (
            name
          )
        )
      `
      )
      .gte("allocation_date", toISODate(weekStart))
      .lte("allocation_date", toISODate(weekEnd))
      .order("allocation_date", { ascending: true })
      .order("sequence_no", { ascending: true })
  ]);

  const businessSettings = (settings ?? null) as BusinessSettingsRow | null;
  const workingDays = new Set(businessSettings?.working_days ?? DEFAULT_WORKING_DAYS);
  const dailyCapacityHours = Number(businessSettings?.workshop_daily_capacity_hours ?? DEFAULT_DAILY_CAPACITY);
  const rows = (allocations ?? []) as CalendarAllocationRow[];
  const allocationsByDate = new Map<string, CalendarAllocationRow[]>();

  for (const row of rows) {
    const current = allocationsByDate.get(row.allocation_date) ?? [];
    current.push(row);
    allocationsByDate.set(row.allocation_date, current);
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const isoDate = toISODate(date);
    const dayRows = (allocationsByDate.get(isoDate) ?? []).sort((left, right) => {
      const leftTime = left.bookings?.preferred_start_time ?? "99:99";
      const rightTime = right.bookings?.preferred_start_time ?? "99:99";
      return leftTime.localeCompare(rightTime);
    });
    const capacity = workingDays.has(date.getDay()) ? dailyCapacityHours : 0;
    const bookedHours = Number(dayRows.reduce((sum, row) => sum + Number(row.hours_allocated), 0).toFixed(2));
    const remainingHours = Number(Math.max(capacity - bookedHours, 0).toFixed(2));

    return {
      date,
      isoDate,
      capacity,
      bookedHours,
      remainingHours,
      allocations: dayRows
    };
  });

  const previousWeekHref = `/admin/calendar?week=${toISODate(subWeeks(weekStart, 1))}`;
  const currentWeekHref = "/admin/calendar";
  const nextWeekHref = `/admin/calendar?week=${toISODate(addWeeks(weekStart, 1))}`;

  return (
    <AdminShell title="Calendar">
      <div className="flex flex-wrap gap-3">
        <Link href={previousWeekHref} className="btn-secondary">
          Previous week
        </Link>
        <Link href={currentWeekHref} className="btn-secondary">
          Current week
        </Link>
        <Link href={nextWeekHref} className="btn-secondary">
          Next week
        </Link>
      </div>

      <div className="panel p-5">
        <p className="text-sm subtle">Week view</p>
        <p className="mt-2 text-xl font-semibold">
          {format(weekStart, "d MMM yyyy")} to {format(weekEnd, "d MMM yyyy")}
        </p>
      </div>

      <div className="grid gap-4">
        {days.map((day) => (
          <section key={day.isoDate} className="panel p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm subtle">{format(day.date, "EEEE")}</p>
                <h2 className="mt-1 text-2xl font-semibold">{format(day.date, "d MMMM yyyy")}</h2>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/4 p-4 md:min-w-[260px]">
                <p className="text-sm font-medium">
                  {day.bookedHours.toFixed(1)}h booked / {day.capacity.toFixed(1)}h capacity
                </p>
                <p className="mt-2 text-sm subtle">{day.remainingHours.toFixed(1)}h remaining</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {day.allocations.length > 0 ? (
                day.allocations.map((allocation) => {
                  const booking = allocation.bookings;

                  return (
                    <Link
                      key={allocation.id}
                      href={`/admin/bookings/${allocation.booking_id}`}
                      className="rounded-2xl border border-white/8 bg-slate-900/70 p-4 transition hover:border-cyan-400/30 hover:bg-slate-900"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="grid gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-cyan-200">{formatStartTime(booking?.preferred_start_time ?? null)}</p>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                                booking?.status ?? "unknown"
                              )}`}
                            >
                              {(booking?.status ?? "unknown").replaceAll("_", " ")}
                            </span>
                          </div>
                          <p className="font-medium">{formatCustomerName(booking?.customers ?? null)}</p>
                          <p className="text-sm subtle">{formatVehicle(booking?.vehicles ?? null)}</p>
                          <p className="text-sm subtle">{booking?.job_types?.name ?? "Job type unavailable"}</p>
                        </div>

                        <div className="grid gap-2 text-sm md:text-right">
                          <p>{Number(allocation.hours_allocated).toFixed(1)}h allocated</p>
                          <p className="subtle">Balance due {formatMoney(booking?.remaining_balance_gbp ?? 0)}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm subtle">
                  No allocated jobs for this day.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
