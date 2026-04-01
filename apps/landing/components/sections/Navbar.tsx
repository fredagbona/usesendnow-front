"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu01Icon, Cancel01Icon } from "hugeicons-react"
import { Button } from "../ui/Button"
import { landingBrand } from "../../lib/brand"
import { BrandMark } from "../shared/BrandMark"

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
  { label: "Documentation", href: landingBrand.docsUrl },
]

interface NavbarProps {}

export function Navbar({}: NavbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0A0A0A]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" className="text-[#FFD600]">
          <BrandMark textClassName="text-[#FFD600]" />
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
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
          <a
            href={`${landingBrand.appUrl}/login`}
            className="font-(family-name:--font-poppins) text-[11px] uppercase tracking-[0.08em] text-[#F0F0F0] transition-colors hover:text-[#FFD600]"
          >
            Connexion
          </a>
          <Button href={`${landingBrand.appUrl}/signup`} size="sm">
            Commencer
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-[#111111] text-[#F0F0F0] lg:hidden"
          aria-label="Ouvrir le menu"
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
              {NAV_LINKS.map((link) => (
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
                <a
                  href={`${landingBrand.appUrl}/login`}
                  className="font-(family-name:--font-poppins) text-sm text-[#F0F0F0]"
                >
                  Connexion
                </a>
                <Button href={`${landingBrand.appUrl}/signup`} size="sm">
                  Commencer
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
