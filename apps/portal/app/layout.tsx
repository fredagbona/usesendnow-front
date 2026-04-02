import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Toaster } from "sonner"
import { portalBrand } from "@/lib/brand"
import ThemeProvider from "@/components/ui/ThemeProvider"
import "./globals.css"

const displayFont = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["700"],
})

const bodyFont = Inter({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "MsgFlash - Portail",
    template: "MsgFlash - %s",
  },
  description: portalBrand.tagline,
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
    title: "MsgFlash - Portail",
    description: portalBrand.tagline,
    type: "website",
    url: portalBrand.appUrl,
    images: [
      {
        url: `${portalBrand.appUrl}/og-image.png`,
        width: 512,
        height: 512,
        alt: "MsgFlash portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MsgFlash - Portail",
    description: portalBrand.tagline,
    images: [`${portalBrand.appUrl}/og-image.png`],
  },
}

const themeBootstrapScript = `
  (function () {
    try {
      var theme = localStorage.getItem("msgflash-portal-theme") || "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (error) {
      document.documentElement.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
    }
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${displayFont.variable} ${bodyFont.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-full bg-bg-subtle text-text antialiased font-body transition-colors duration-200">
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            gap={8}
            visibleToasts={4}
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
