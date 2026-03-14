import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Section({
  className,
  children,
  containerClassName
}: {
  className?: string;
  children: React.ReactNode;
  containerClassName?: string;
}) {
  return (
    <section className={cn("py-12 md:py-20", className)}>
      <div className={cn("container-shell", containerClassName)}>{children}</div>
    </section>
  );
}

export function PrimaryButton({
  href,
  className,
  children
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn("btn-primary", className)}>
      {children}
    </Link>
  );
}

export function SecondaryButton({
  href,
  className,
  children
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn("btn-secondary", className)}>
      {children}
    </Link>
  );
}

export function DarkCard({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("panel-soft", className)}>{children}</div>;
}

export function Pill({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("badge", className)}>{children}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <Pill>{eyebrow}</Pill> : null}
      <h2 className="section-title mt-4">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 subtle">{description}</p> : null}
    </div>
  );
}

export function TrustItem({
  title,
  className
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4", className)}>
      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
      <p className="text-sm font-medium text-white/88">{title}</p>
    </div>
  );
}

export function StepCard({
  number,
  title,
  className
}: {
  number: string;
  title: string;
  className?: string;
}) {
  return (
    <DarkCard className={cn("p-5 md:p-6", className)}>
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm font-semibold text-white">
          {number}
        </span>
        <p className="text-base font-medium text-white">{title}</p>
      </div>
    </DarkCard>
  );
}

export function ReviewCard({
  rating,
  body,
  author,
  className
}: {
  rating: number;
  body: string;
  author: string;
  className?: string;
}) {
  return (
    <DarkCard className={cn("p-6", className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn("h-4 w-4", index < rating ? "fill-[var(--accent)] text-[var(--accent)]" : "text-white/18")}
          />
        ))}
      </div>
      <p className="mt-4 text-sm leading-7 subtle">{body}</p>
      <p className="mt-5 text-sm font-medium text-white">{author}</p>
    </DarkCard>
  );
}
