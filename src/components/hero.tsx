import Link from "next/link";

export function Hero() {
  return (
    <section className="container-shell py-16 md:py-24">
      <div className="panel grid gap-10 overflow-hidden p-8 md:grid-cols-[1.15fr_0.85fr] md:p-12">
        <div>
          <span className="badge">Specialist workshop booking</span>
          <h1 className="page-title mt-5 max-w-3xl">
            Book wet belt and timing work online without the back and forth.
          </h1>
          <p className="mt-5 max-w-2xl text-base subtle md:text-lg">
            Vehicle specific pricing, only valid booking slots shown, a fixed £50 booking fee online and a secure live tracking page once booked.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn-primary">
              Book now
            </Link>
            <Link href="/reviews" className="btn-secondary">
              Read reviews
            </Link>
          </div>
        </div>

        <div className="panel-soft grid gap-4 p-5">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/8 p-4">
            <p className="text-sm font-medium text-cyan-300">What customers see</p>
            <p className="mt-2 text-sm subtle">
              Price and downtime only. Internal labour hours stay hidden.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-sm font-medium">Workshop logic</p>
            <p className="mt-2 text-sm subtle">
              Daily capacity is controlled in admin. Jobs carry into the next working days automatically when needed.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-sm font-medium">After booking</p>
            <p className="mt-2 text-sm subtle">
              Stripe collects the booking fee and confirms the booking. Admin can then post updates, photos and videos to the customer portal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
