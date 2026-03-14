import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wigan Wetbelts",
  description: "Vehicle specific wet belt and timing work booking platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
