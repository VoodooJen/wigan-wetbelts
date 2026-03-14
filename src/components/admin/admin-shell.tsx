import Link from "next/link";
import { CalendarDays, CarFront, LayoutDashboard, MessageSquareText, Settings, Wrench } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/bookings", label: "Bookings", icon: Wrench },
  { href: "/admin/vehicles", label: "Vehicles", icon: CarFront },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export function AdminShell({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container-shell grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="panel h-fit p-4">
          <div className="px-2">
            <BrandLogo href="/admin/dashboard" compact />
            <p className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/42">Admin</p>
          </div>
          <nav className="mt-4 grid gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white/70 transition hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="grid gap-6">
          <div>
            <p className="text-sm subtle">Admin</p>
            <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
