"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/book", label: "Book" },
  { href: "/supported-vehicles", label: "Supported Vehicles" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-black/88 backdrop-blur-xl">
      <div className="container-shell">
        <div className="flex items-center justify-between py-4">
          <BrandLogo compact />

          <nav className="hidden items-center gap-2 md:flex">
            {nav.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-white/72 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white md:hidden"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen ? (
          <div className="grid gap-2 border-t border-white/8 py-4 md:hidden">
            {nav.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-white/[0.02] text-white/80"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </header>
  );
}
