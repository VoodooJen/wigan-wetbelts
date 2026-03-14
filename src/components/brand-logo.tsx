import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ href = "/", className, compact = false }: BrandLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] text-[0.68rem] font-semibold tracking-[0.34em] text-white">
        WW
      </div>
      <div className={cn("min-w-0", compact && "hidden sm:block")}>
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.34em] text-white/55">Wigan</p>
        <p className="text-sm font-semibold tracking-[0.18em] text-white">WETBELTS</p>
      </div>
    </div>
  );

  return (
    <Link href={href} aria-label="Wigan Wetbelts" className="inline-flex items-center">
      {content}
    </Link>
  );
}
