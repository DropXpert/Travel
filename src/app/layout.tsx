import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { brandName, productionUrl } from "@/brand";
import { siteOpenGraph } from "./_shared/public-metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  applicationName: brandName,
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
  title: { default: siteOpenGraph.title, template: `%s | ${brandName}` },
  description: siteOpenGraph.description,
  openGraph: siteOpenGraph,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
