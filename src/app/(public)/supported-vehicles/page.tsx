import { DarkCard, Pill, PrimaryButton, Section } from "@/components/ui";
import { getVehicleTree } from "@/lib/queries";

export default async function SupportedVehiclesPage() {
  const vehicles = await getVehicleTree();
  const items =
    vehicles.length > 0
      ? vehicles.slice(0, 12).map((vehicle) => `${vehicle.make} ${vehicle.model} ${vehicle.engine}`)
      : ["Ford EcoBoost", "Ford EcoBlue", "Peugeot PureTech", "Vauxhall 1.2", "VW / Audi / Skoda TDI"];

  return (
    <Section className="pb-16 pt-10 md:pt-14 md:pb-20">
      <div className="max-w-3xl">
        <Pill>Supported Vehicles</Pill>
        <h1 className="page-title mt-5">Supported Vehicles</h1>
        <p className="mt-5 text-base leading-8 subtle md:text-lg">
          We currently offer online booking for selected engines and vehicle types.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <DarkCard key={item} className="p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/46">Available online</p>
            <p className="mt-5 text-lg font-medium text-white">{item}</p>
          </DarkCard>
        ))}
      </div>

      <div className="mt-8">
        <PrimaryButton href="/book">Check Your Vehicle</PrimaryButton>
      </div>
    </Section>
  );
}
