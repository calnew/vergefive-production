import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010"),
  title: {
    default: "Verge Five | Business Credit Readiness",
    template: "%s | Verge Five",
  },
  description: "Run a business visibility scan, fix readiness gaps, and follow a guided business credit buildout without lending promises.",
  openGraph: {
    title: "Verge Five Business Credit Readiness",
    description: "Scan the business profile, fix what matters, and unlock the right readiness path.",
    url: "/",
    siteName: "Verge Five",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Verge Five readiness dashboard preview" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verge Five Business Credit Readiness",
    description: "Run the scan. Fix what matters. Unlock the right accounts.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} font-sans`}>{children}</body>
    </html>
  );
}
