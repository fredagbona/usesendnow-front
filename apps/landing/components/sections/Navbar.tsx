"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu01Icon, Cancel01Icon } from "hugeicons-react"
import { landingBrand } from "../../lib/brand"
import { BrandMark } from "../shared/BrandMark"
import { Button } from "../ui/Button"
import { useLandingI18n } from "../../lib/landing-i18n"
import { getLandingV2Copy } from "../../lib/landing-v2-copy"

interface NavbarProps {}

export function Navbar({}: NavbarProps) {
  const [open, setOpen] = useState(false)
  const { locale, setLocale } = useLandingI18n()
  const copy = getLandingV2Copy(locale)

  const links = [
    { label: copy.nav.product, href: "/product" },
    { label: copy.nav.useCases, href: "/solutions" },
    { label: copy.nav.integrations, href: "/integrations" },
    { label: copy.nav.pricing, href: "/#pricing" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FCFAF4]/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" className="shrink-0">
          <BrandMark textClassName="text-[#171515]" />
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-(family-name:--font-geist-sans) text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5F5750] transition-colors hover:text-[#171515]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="inline-flex items-center rounded-sm border border-black/10 bg-white p-1 shadow-[0_8px_30px_rgba(23,21,21,0.06)]">
            {(["en", "fr"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocale(item)}
                className={[
                  "rounded-sm px-3 py-1.5 font-(family-name:--font-geist-sans) text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                  locale === item ? "bg-[#FFD600] text-[#171515]" : "text-[#6F685F] hover:text-[#171515]",
                ].join(" ")}
                aria-pressed={locale === item}
              >
                {item}
              </button>
            ))}
          </div>
          <Button href={`${landingBrand.appUrl}/signup`} size="sm">
            {copy.nav.login}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-black/10 bg-white text-[#171515] shadow-[0_8px_24px_rgba(23,21,21,0.06)] transition-transform active:scale-[0.98] lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
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
            transition={{ duration: 0.18 }}
            className="border-t border-black/10 bg-[#FCFAF4] px-4 py-4 sm:px-6 lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-(family-name:--font-geist-sans) text-sm font-medium text-[#2A2420]"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 border-t border-black/10 pt-4">
                <div className="inline-flex items-center rounded-sm border border-black/10 bg-white p-1 w-fit">
                  {(["en", "fr"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLocale(item)}
                      className={[
                        "rounded-sm px-3 py-1.5 font-(family-name:--font-geist-sans) text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                        locale === item ? "bg-[#FFD600] text-[#171515]" : "text-[#6F685F] hover:text-[#171515]",
                      ].join(" ")}
                      aria-pressed={locale === item}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <Button href={`${landingBrand.appUrl}/signup`} size="sm">{copy.nav.login}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
