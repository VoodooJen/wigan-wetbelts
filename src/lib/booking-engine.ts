import { addDays, parseISO } from "date-fns";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AllocationChunk = {
  allocationDate: string;
  hoursAllocated: number;
  sequenceNo: number;
};

export type AvailabilityResult = {
  startDate: string;
  startTime: string;
  allocations: AllocationChunk[];
};

type BusinessSettingsRow = {
  workshop_daily_capacity_hours?: number | string | null;
  workshop_start_time?: string | null;
  workshop_end_time?: string | null;
  slot_interval_minutes?: number | string | null;
  working_days?: number[] | null;
};

type AllocationRow = {
  allocation_date: string;
  hours_allocated: number | string;
  bookings?: { status?: string | null } | Array<{ status?: string | null }> | null;
};

type HoldRow = {
  allocations_json: unknown;
};

type BookingEngineSettings = {
  dailyCapacityHours: number;
  workshopStartTime: string;
  workshopEndTime: string;
  slotIntervalMinutes: number;
  workingDays: Set<number>;
  workshopStartMinutes: number;
  workshopEndMinutes: number;
  workshopOpenHours: number;
  maxBookableHoursPerDay: number;
};

type AvailabilityContext = {
  settings: BookingEngineSettings;
  bookedHoursByDay: Map<string, number>;
  searchEndDateISO: string;
};

const DEFAULT_DAILY_CAPACITY = 6.5;
const DEFAULT_WORKSHOP_START_TIME = "07:30";
const DEFAULT_WORKSHOP_END_TIME = "15:00";
const DEFAULT_SLOT_INTERVAL_MINUTES = 30;
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_SEARCH_WINDOW_DAYS = 60;

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function roundHours(hours: number) {
  return Number(hours.toFixed(2));
}

function parseClockTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatClockTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function normalizePositiveNumber(value: number | string | null | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeSettings(row: BusinessSettingsRow | null | undefined): BookingEngineSettings {
  const workshopStartTime = row?.workshop_start_time ?? DEFAULT_WORKSHOP_START_TIME;
  const workshopEndTime = row?.workshop_end_time ?? DEFAULT_WORKSHOP_END_TIME;
  const workshopStartMinutes = parseClockTime(workshopStartTime) ?? parseClockTime(DEFAULT_WORKSHOP_START_TIME)!;
  const workshopEndMinutes = parseClockTime(workshopEndTime) ?? parseClockTime(DEFAULT_WORKSHOP_END_TIME)!;
  const slotIntervalMinutes = Math.max(
    1,
    Math.floor(normalizePositiveNumber(row?.slot_interval_minutes, DEFAULT_SLOT_INTERVAL_MINUTES))
  );
  const workshopOpenHours = Math.max((workshopEndMinutes - workshopStartMinutes) / 60, 0);
  const dailyCapacityHours = normalizePositiveNumber(row?.workshop_daily_capacity_hours, DEFAULT_DAILY_CAPACITY);
  const maxBookableHoursPerDay = roundHours(Math.min(dailyCapacityHours, workshopOpenHours));
  const workingDays = new Set(
    (row?.working_days?.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6) ?? DEFAULT_WORKING_DAYS)
  );

  return {
    dailyCapacityHours,
    workshopStartTime: formatClockTime(workshopStartMinutes),
    workshopEndTime: formatClockTime(workshopEndMinutes),
    slotIntervalMinutes,
    workingDays,
    workshopStartMinutes,
    workshopEndMinutes,
    workshopOpenHours,
    maxBookableHoursPerDay
  };
}

function isWorkingDay(date: Date, settings: BookingEngineSettings) {
  return settings.workingDays.has(date.getDay());
}

function getStatuses(value: AllocationRow["bookings"]) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

async function getSettings() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("business_settings").select("*").limit(1).maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeSettings((data ?? null) as BusinessSettingsRow | null);
}

async function getBookedHoursByDay(startDate: string, endDate: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_allocations")
    .select("allocation_date, hours_allocated, bookings!inner(status)")
    .gte("allocation_date", startDate)
    .lte("allocation_date", endDate);

  if (error) {
    throw error;
  }

  const hoursMap = new Map<string, number>();

  for (const row of (data ?? []) as AllocationRow[]) {
    const statuses = getStatuses(row.bookings);

    if (statuses.some((booking) => booking.status === "cancelled")) {
      continue;
    }

    const date = row.allocation_date;
    const current = hoursMap.get(date) ?? 0;
    const hoursAllocated = Number(row.hours_allocated);
    hoursMap.set(date, roundHours(current + (Number.isFinite(hoursAllocated) ? hoursAllocated : 0)));
  }

  return hoursMap;
}

function isAllocationChunk(value: unknown): value is AllocationChunk {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AllocationChunk>;
  const hoursAllocated = Number(candidate.hoursAllocated);
  const sequenceNo = Number(candidate.sequenceNo);

  return (
    typeof candidate.allocationDate === "string" &&
    Number.isFinite(hoursAllocated) &&
    Number.isFinite(sequenceNo)
  );
}

async function getHeldHoursByDay(endDate: string) {
  const supabase = createSupabaseAdminClient();
  const nowISO = new Date().toISOString();
  const { data, error } = await supabase
    .from("booking_holds")
    .select("allocations_json")
    .eq("status", "active")
    .gt("expires_at", nowISO)
    .lte("preferred_start_date", endDate);

  if (error) {
    throw error;
  }

  const hoursMap = new Map<string, number>();

  for (const row of (data ?? []) as HoldRow[]) {
    const allocations = Array.isArray(row.allocations_json) ? row.allocations_json : [];

    for (const allocation of allocations) {
      if (!isAllocationChunk(allocation)) {
        continue;
      }

      const current = hoursMap.get(allocation.allocationDate) ?? 0;
      hoursMap.set(allocation.allocationDate, roundHours(current + Number(allocation.hoursAllocated)));
    }
  }

  return hoursMap;
}

async function buildAvailabilityContext(startDateISO: string, searchWindowDays = DEFAULT_SEARCH_WINDOW_DAYS): Promise<AvailabilityContext> {
  const settings = await getSettings();
  const startDate = parseISO(startDateISO);
  const searchEndDateISO = toISODate(addDays(startDate, searchWindowDays));
  const [bookedHoursByDay, heldHoursByDay] = await Promise.all([
    getBookedHoursByDay(startDateISO, searchEndDateISO),
    getHeldHoursByDay(searchEndDateISO)
  ]);

  for (const [date, heldHours] of heldHoursByDay.entries()) {
    if (date < startDateISO || date > searchEndDateISO) {
      continue;
    }

    const current = bookedHoursByDay.get(date) ?? 0;
    bookedHoursByDay.set(date, roundHours(current + heldHours));
  }

  return {
    settings,
    bookedHoursByDay,
    searchEndDateISO
  };
}

function calculateAllocationsForSlot(
  startDateISO: string,
  startTime: string,
  durationHours: number,
  context: AvailabilityContext
): AvailabilityResult | null {
  const normalizedDuration = roundHours(durationHours);

  if (normalizedDuration <= 0) {
    return null;
  }

  const { settings, bookedHoursByDay, searchEndDateISO } = context;
  const startDate = parseISO(startDateISO);
  const startMinutes = parseClockTime(startTime);

  if (startMinutes === null || !isWorkingDay(startDate, settings)) {
    return null;
  }

  if (settings.maxBookableHoursPerDay <= 0) {
    return null;
  }

  if (startMinutes < settings.workshopStartMinutes || startMinutes >= settings.workshopEndMinutes) {
    return null;
  }

  let remaining = normalizedDuration;
  let cursor = new Date(startDate);
  let sequenceNo = 1;
  const allocations: AllocationChunk[] = [];

  while (remaining > 0 && toISODate(cursor) <= searchEndDateISO) {
    if (!isWorkingDay(cursor, settings)) {
      cursor = addDays(cursor, 1);
      continue;
    }

    const allocationDate = toISODate(cursor);
    const bookedHours = bookedHoursByDay.get(allocationDate) ?? 0;
    const remainingDailyCapacity = roundHours(Math.max(settings.dailyCapacityHours - bookedHours, 0));

    if (remainingDailyCapacity <= 0) {
      cursor = addDays(cursor, 1);
      continue;
    }

    const usableWindowHours =
      allocationDate === startDateISO
        ? roundHours(Math.max((settings.workshopEndMinutes - startMinutes) / 60, 0))
        : settings.workshopOpenHours;

    const availableHoursToday = roundHours(
      Math.min(remainingDailyCapacity, usableWindowHours, settings.maxBookableHoursPerDay)
    );

    if (availableHoursToday > 0) {
      const hoursAllocated = roundHours(Math.min(availableHoursToday, remaining));
      allocations.push({
        allocationDate,
        hoursAllocated,
        sequenceNo
      });
      remaining = roundHours(remaining - hoursAllocated);
      sequenceNo += 1;
    }

    cursor = addDays(cursor, 1);
  }

  if (remaining > 0 || allocations.length === 0) {
    return null;
  }

  return {
    startDate: startDateISO,
    startTime: formatClockTime(startMinutes),
    allocations
  };
}

function roundUpToSlot(minutes: number, slotIntervalMinutes: number) {
  return Math.ceil(minutes / slotIntervalMinutes) * slotIntervalMinutes;
}

function getSlotStartMinutes(dateISO: string, settings: BookingEngineSettings) {
  const startMinutes = settings.workshopStartMinutes;
  const todayISO = toISODate(new Date());

  if (dateISO !== todayISO) {
    return startMinutes;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return Math.max(startMinutes, roundUpToSlot(currentMinutes, settings.slotIntervalMinutes));
}

function listSlotsForDate(dateISO: string, settings: BookingEngineSettings) {
  const slotStartMinutes = getSlotStartMinutes(dateISO, settings);
  const slots: string[] = [];

  for (
    let minutes = slotStartMinutes;
    minutes < settings.workshopEndMinutes;
    minutes += settings.slotIntervalMinutes
  ) {
    slots.push(formatClockTime(minutes));
  }

  return slots;
}

export async function calculateAllocations(
  startDateISO: string,
  durationHours: number,
  startTime = DEFAULT_WORKSHOP_START_TIME
): Promise<AvailabilityResult | null> {
  const context = await buildAvailabilityContext(startDateISO);
  return calculateAllocationsForSlot(startDateISO, startTime, durationHours, context);
}

export async function getAvailableStartSlots(
  durationHours: number,
  fromDateISO: string,
  daysToScan = 30
): Promise<AvailabilityResult[]> {
  const context = await buildAvailabilityContext(fromDateISO, Math.max(daysToScan + DEFAULT_SEARCH_WINDOW_DAYS, DEFAULT_SEARCH_WINDOW_DAYS));
  const { settings } = context;
  const availableSlots: AvailabilityResult[] = [];
  let cursor = parseISO(fromDateISO);

  for (let i = 0; i < daysToScan; i += 1) {
    if (isWorkingDay(cursor, settings)) {
      const dateISO = toISODate(cursor);

      for (const startTime of listSlotsForDate(dateISO, settings)) {
        const slot = calculateAllocationsForSlot(dateISO, startTime, durationHours, context);

        if (slot) {
          availableSlots.push(slot);
        }
      }
    }

    cursor = addDays(cursor, 1);
  }

  return availableSlots;
}

export async function getAvailableStartDates(durationHours: number, fromDateISO: string, daysToScan = 30) {
  return getAvailableStartSlots(durationHours, fromDateISO, daysToScan);
}
