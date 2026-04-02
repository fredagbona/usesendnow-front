import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { landingBrand } from "../lib/brand";
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

export const metadata: Metadata = {
  title: "MsgFlash - Infrastructure WhatsApp pour produits et automatisations",
  description: landingBrand.tagline,
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
    title: "MsgFlash - Infrastructure WhatsApp pour produits et automatisations",
    description: landingBrand.tagline,
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
    title: "MsgFlash - Infrastructure WhatsApp pour produits et automatisations",
    description: landingBrand.tagline,
    images: [`${landingBrand.appUrl.replace("app.", "")}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-[#F0F0F0]">
        {children}
      </body>
    </html>
  );
}
