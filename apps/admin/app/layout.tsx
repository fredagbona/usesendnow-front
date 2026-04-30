import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { AdminThemeProvider } from "@/components/ui/ThemeProvider"
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
})

export const metadata: Metadata = {
  title: "msgflash — Admin",
  description: "Console interne d’administration msgflash.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "msgflash — Admin",
    description: "Console interne d’administration msgflash.",
    type: "website",
    url: "https://admin.msgflash.com",
    images: [
      {
        url: "https://admin.msgflash.com/og-image.png",
        width: 512,
        height: 512,
        alt: "msgflash admin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "msgflash — Admin",
    description: "Console interne d’administration msgflash.",
    images: ["https://admin.msgflash.com/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AdminThemeProvider>{children}</AdminThemeProvider>
      </body>
    </html>
  )
}
