"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { formatMoney } from "@/lib/utils";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  engine: string;
};

type JobType = {
  id: string;
  name: string;
};

type AllocationChunk = {
  allocationDate: string;
  hoursAllocated: number;
  sequenceNo: number;
};

type AvailableSlot = {
  startDate: string;
  startTime: string;
  allocations: AllocationChunk[];
};

type QuoteResponse = {
  vehicleServiceId: string;
  vehicleId: string;
  jobTypeId: string;
  priceGbp: number;
  bookingFeeGbp: number;
  remainingBalanceGbp: number;
  downtimeLabel: string;
  availableSlots: AvailableSlot[];
};

type Props = {
  vehicles: Vehicle[];
  jobTypes: JobType[];
};

export function BookingForm({ vehicles, jobTypes }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [selectedMake, setSelectedMake] = useState(params.get("make") ?? "");
  const [selectedModel, setSelectedModel] = useState(params.get("model") ?? "");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedJobTypeId, setSelectedJobTypeId] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState("");
  const [isPending, startTransition] = useTransition();

  const makes = useMemo(
    () => Array.from(new Set(vehicles.map((vehicle) => vehicle.make))),
    [vehicles]
  );

  const models = useMemo(
    () =>
      Array.from(
        new Set(
          vehicles
            .filter((vehicle) => vehicle.make === selectedMake)
            .map((vehicle) => vehicle.model)
        )
      ),
    [vehicles, selectedMake]
  );

  const engines = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          vehicle.make === selectedMake &&
          vehicle.model === selectedModel
      ),
    [vehicles, selectedMake, selectedModel]
  );

  useEffect(() => {
    setSelectedVehicleId("");
    setQuote(null);
    setSelectedSlotKey("");
  }, [selectedMake, selectedModel]);

  useEffect(() => {
    setSelectedSlotKey("");
  }, [selectedVehicleId, selectedJobTypeId]);

  const selectedSlot = useMemo(
    () =>
      quote?.availableSlots.find(
        (slot) => `${slot.startDate}T${slot.startTime}` === selectedSlotKey
      ) ?? null,
    [quote, selectedSlotKey]
  );

  function formatSlotLabel(slot: AvailableSlot) {
    return format(parseISO(`${slot.startDate}T${slot.startTime}:00`), "EEEE d MMMM yyyy 'at' HH:mm");
  }

  async function loadQuote(vehicleId: string, jobTypeId: string) {
    if (!vehicleId || !jobTypeId) return;
    startTransition(async () => {
      const response = await fetch("/api/booking/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ vehicleId, jobTypeId })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error ?? "Unable to load quote");
        return;
      }

      setQuote(data);
      setSelectedSlotKey("");
    });
  }

  async function startCheckout() {
    if (!quote || !selectedSlot) {
      alert("Please choose a valid booking slot");
      return;
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        vehicleServiceId: quote.vehicleServiceId,
        preferredStartDate: selectedSlot.startDate,
        preferredStartTime: selectedSlot.startTime
      })
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.error ?? "Unable to start checkout");
      return;
    }

    router.push(data.checkoutUrl);
  }

  return (
    <div className="panel p-5 md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/84">Make</label>
          <select className="field" value={selectedMake} onChange={(event) => setSelectedMake(event.target.value)}>
            <option value="">Select make</option>
            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/84">Model</label>
          <select className="field" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}>
            <option value="">Select model</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/84">Engine</label>
          <select
            className="field"
            value={selectedVehicleId}
            onChange={(event) => {
              const nextVehicleId = event.target.value;
              setSelectedVehicleId(nextVehicleId);
              if (nextVehicleId && selectedJobTypeId) {
                void loadQuote(nextVehicleId, selectedJobTypeId);
              }
            }}
          >
            <option value="">Select engine</option>
            {engines.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.engine}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/84">Job type</label>
          <select
            className="field"
            value={selectedJobTypeId}
            onChange={(event) => {
              const nextJobTypeId = event.target.value;
              setSelectedJobTypeId(nextJobTypeId);
              if (selectedVehicleId && nextJobTypeId) {
                void loadQuote(selectedVehicleId, nextJobTypeId);
              }
            }}
          >
            <option value="">Select service</option>
            {jobTypes.map((jobType) => (
              <option key={jobType.id} value={jobType.id}>
                {jobType.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {quote ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="panel-soft p-5 md:p-6">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/46">Pricing</p>
            <p className="mt-5 text-sm subtle">Total job price</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatMoney(quote.priceGbp)}</p>
            <div className="mt-6 grid gap-4 rounded-[1.4rem] border border-white/8 bg-white/[0.02] p-4">
              <div>
                <p className="text-sm subtle">£50 booking fee payable now</p>
                <p className="mt-1 text-lg font-medium text-white">{formatMoney(quote.bookingFeeGbp)}</p>
              </div>
              <div>
                <p className="text-sm subtle">Remaining balance due</p>
                <p className="mt-1 text-lg font-medium text-white">{formatMoney(quote.remainingBalanceGbp)}</p>
              </div>
            </div>
            <p className="mt-4 text-sm subtle">The £50 booking fee will be deducted from your final bill.</p>
            <p className="mt-6 text-sm subtle">Downtime</p>
            <p className="mt-1 font-medium text-white">{quote.downtimeLabel}</p>
          </div>

          <div className="panel-soft p-5 md:p-6">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/46">Booking slot</p>
            <label className="mb-2 mt-5 block text-sm font-medium text-white/84">Available booking slots</label>
            <select className="field" value={selectedSlotKey} onChange={(event) => setSelectedSlotKey(event.target.value)}>
              <option value="">Select a booking slot</option>
              {quote.availableSlots.map((slot) => {
                const slotKey = `${slot.startDate}T${slot.startTime}`;

                return (
                  <option key={slotKey} value={slotKey}>
                    {formatSlotLabel(slot)}
                  </option>
                );
              })}
            </select>
            <p className="mt-3 text-sm subtle">Only fully valid booking slots are shown.</p>
            {quote.availableSlots.length === 0 ? (
              <p className="mt-3 text-sm subtle">No booking slots are currently available for this service.</p>
            ) : null}
            <button className="btn-primary mt-6 w-full" disabled={isPending || !selectedSlot} onClick={startCheckout}>
              {isPending ? "Loading..." : "Pay and book"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-[1.6rem] border border-dashed border-white/10 bg-white/[0.015] p-5 text-sm subtle">
          Select a vehicle and service to load pricing and valid booking slots.
        </div>
      )}
    </div>
  );
}
