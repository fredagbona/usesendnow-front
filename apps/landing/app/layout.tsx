import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { landingBrand } from "../lib/brand";
import { detectLandingLocaleFromHeaders } from "../lib/landing-locale.server";
import { LandingLocaleProvider } from "../lib/landing-i18n";
import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["700"],
});

const bodyFont = Inter({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()

  return {
    title: "MsgFlash - " + (locale === "en" ? "WhatsApp infrastructure for products and automations" : "Infrastructure WhatsApp pour produits et automatisations"),
    description: locale === "en"
      ? "WhatsApp infrastructure for products and automations."
      : landingBrand.tagline,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      title: locale === "en" ? "MsgFlash - WhatsApp infrastructure for products and automations" : "MsgFlash - Infrastructure WhatsApp pour produits et automatisations",
      description: locale === "en"
        ? "WhatsApp infrastructure for products and automations."
        : landingBrand.tagline,
      type: "website",
      url: `https://${landingBrand.domain}`,
      images: [
        {
          url: `${landingBrand.appUrl.replace("app.", "")}/og-image.png`,
          width: 512,
          height: 512,
          alt: "MsgFlash landing",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: locale === "en" ? "MsgFlash - WhatsApp infrastructure for products and automations" : "MsgFlash - Infrastructure WhatsApp pour produits et automatisations",
      description: locale === "en"
        ? "WhatsApp infrastructure for products and automations."
        : landingBrand.tagline,
      images: [`${landingBrand.appUrl.replace("app.", "")}/og-image.png`],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = await detectLandingLocaleFromHeaders()

  return (
    <html lang={initialLocale} className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-[#F0F0F0]">
        <LandingLocaleProvider initialLocale={initialLocale}>
          <Script
            defer
            src="https://analytics.aivisuel.cloud/script.js"
            data-website-id="19dfa8fa-d267-47ee-816d-ebfcc5b54acf"
          />
          {children}
        </LandingLocaleProvider>
      </body>
    </html>
  );
}
