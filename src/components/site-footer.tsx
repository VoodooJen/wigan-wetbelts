import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const links = [
  { href: "/book", label: "Book" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-black/70">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.3fr_0.7fr_0.7fr] md:py-14">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-md text-sm leading-7 subtle">
            Premium specialist booking for wet belt and timing belt replacement, with transparent pricing and a secure
            online booking fee journey.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/64">Explore</p>
          <div className="mt-4 grid gap-3 text-sm">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="subtle transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/64">Contact</p>
          <div className="mt-4 grid gap-3 text-sm subtle">
            <a href="tel:08000982580" className="transition hover:text-white">
              0800 098 2580
            </a>
            <a href="mailto:accounts@voodoomotorworks.co.uk" className="transition hover:text-white">
              accounts@voodoomotorworks.co.uk
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="container-shell py-5 text-xs uppercase tracking-[0.2em] text-white/38">
          © 2026 Wigan Wetbelts. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
