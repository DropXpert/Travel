import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { brandName, productionUrl } from "@/brand";
import { siteOpenGraph } from "./_shared/public-metadata";
import "./globals.css";

const nunito = localFont({
  src: "./_home/nunito-extrabold.woff2",
  variable: "--font-nunito",
  weight: "800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  applicationName: brandName,
  icons: { icon: { url: "/share-yarana-icon.png", type: "image/png", sizes: "64x64" } },
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
    <html lang="en-IN" className={nunito.variable}>
      <body>{children}</body>
    </html>
  );
}
