import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-surface">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
