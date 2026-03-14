import { DarkCard, Pill, Section } from "@/components/ui";

export default function ContactPage() {
  return (
    <Section className="pb-16 pt-10 md:pt-14 md:pb-20">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-6 md:p-8">
          <Pill>Contact</Pill>
          <h1 className="page-title mt-5">Need help before booking?</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 subtle">
            If you are unsure whether your vehicle is supported, or you want to discuss the job before booking, get in
            touch and we will point you in the right direction.
          </p>
        </div>

        <DarkCard className="p-6 md:p-8">
          <div className="grid gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/46">Phone</p>
              <a href="tel:08000982580" className="mt-3 block text-lg font-medium text-white">
                0800 098 2580
              </a>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/46">Email</p>
              <a
                href="mailto:accounts@voodoomotorworks.co.uk"
                className="mt-3 block break-all text-lg font-medium text-white"
              >
                accounts@voodoomotorworks.co.uk
              </a>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/46">Hours</p>
              <p className="mt-3 text-base subtle">Online booking is available 24/7. Phone support is available during workshop hours.</p>
            </div>
          </div>
        </DarkCard>
      </div>
    </Section>
  );
}
