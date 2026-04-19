"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu01Icon, Cancel01Icon } from "hugeicons-react"
import { Button } from "../ui/Button"
import { landingBrand } from "../../lib/brand"
import { BrandMark } from "../shared/BrandMark"
import { useLandingI18n } from "../../lib/landing-i18n"

interface NavbarProps {}

export function Navbar({}: NavbarProps) {
  const [open, setOpen] = useState(false)
  const { locale, setLocale, messages } = useLandingI18n()

  const navLinks = [
    { label: messages.nav.features, href: "#fonctionnalites" },
    { label: messages.nav.pricing, href: "#tarifs" },
    { label: messages.nav.faq, href: "#faq" },
    { label: messages.nav.docs, href: landingBrand.docsUrl },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0A0A0A]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" className="text-[#FFD600]">
          <BrandMark textClassName="text-[#FFD600]" />
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-(family-name:--font-poppins) text-[11px] uppercase tracking-[0.08em] text-[#F0F0F0]/72 transition-colors hover:text-[#FFD600]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="inline-flex items-center gap-1 border border-white/10 bg-[#111111] p-1">
            {(["fr", "en"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocale(item)}
                className={[
                  "px-2.5 py-1 font-(family-name:--font-geist-sans) text-[10px] font-bold uppercase tracking-[0.12em] transition-colors",
                  locale === item ? "bg-[#FFD600] text-[#0A0A0A]" : "text-[#B8B8B8] hover:text-[#F0F0F0]",
                ].join(" ")}
                aria-pressed={locale === item}
              >
                {item}
              </button>
            ))}
          </div>
          <a
            href={`${landingBrand.appUrl}/login`}
            className="font-(family-name:--font-poppins) text-[11px] uppercase tracking-[0.08em] text-[#F0F0F0] transition-colors hover:text-[#FFD600]"
          >
            {messages.nav.login}
          </a>
          <Button href={`${landingBrand.appUrl}/signup`} size="sm">
            {messages.nav.getStarted}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-[#111111] text-[#F0F0F0] lg:hidden"
          aria-label={messages.nav.openMenu}
        >
          {open ? <Cancel01Icon className="h-5 w-5" /> : <Menu01Icon className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/8 bg-[#0A0A0A] px-4 py-4 sm:px-6 lg:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-(family-name:--font-poppins) text-sm text-[#F0F0F0]"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 border-t border-white/8 pt-4">
                <div className="inline-flex items-center gap-1 border border-white/10 bg-[#111111] p-1">
                  {(["fr", "en"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLocale(item)}
                      className={[
                        "px-2.5 py-1 font-(family-name:--font-geist-sans) text-[10px] font-bold uppercase tracking-[0.12em] transition-colors",
                        locale === item ? "bg-[#FFD600] text-[#0A0A0A]" : "text-[#B8B8B8] hover:text-[#F0F0F0]",
                      ].join(" ")}
                      aria-pressed={locale === item}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <a href={`${landingBrand.appUrl}/login`} className="font-(family-name:--font-poppins) text-sm text-[#F0F0F0]">
                  {messages.nav.login}
                </a>
                <Button href={`${landingBrand.appUrl}/signup`} size="sm">
                  {messages.nav.getStarted}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
