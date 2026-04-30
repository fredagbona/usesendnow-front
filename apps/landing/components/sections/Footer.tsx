"use client"

import { landingBrand } from "../../lib/brand"
import { BrandMark } from "../shared/BrandMark"
import { useLandingI18n } from "../../lib/landing-i18n"

interface FooterProps {}

export function Footer({}: FooterProps) {
  const { messages } = useLandingI18n()
  const footerColumns = [
    {
      title: messages.footer.product,
      links: [
        { label: messages.footer.links.automations, href: landingBrand.homeAnchors.features },
        { label: messages.footer.links.campaigns, href: landingBrand.campaignsUrl },
        { label: messages.footer.links.wordpress, href: landingBrand.wordpressUrl },
        { label: messages.footer.links.pricing, href: landingBrand.homeAnchors.pricing },
        { label: messages.footer.links.api, href: landingBrand.docsUrl },
      ],
    },
    {
      title: messages.footer.resources,
      links: [
        { label: messages.footer.links.docs, href: landingBrand.docsUrl },
        { label: messages.footer.links.webhook, href: `${landingBrand.docsUrl}/webhooks` },
        { label: messages.footer.links.status, href: landingBrand.appUrl },
      ],
    },
    {
      title: messages.footer.legal,
      links: [
        { label: messages.footer.links.privacy, href: "/politique-confidentialite" },
        { label: messages.footer.links.terms, href: "/conditions-utilisation" },
        { label: messages.footer.links.contact, href: "/contact" },
      ],
    },
  ]

  return (
    <footer className="border-t border-white/8 bg-[#0A0A0A] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="space-y-3">
            <BrandMark textClassName="text-[#FFD600]" />
            <p className="max-w-xs font-(family-name:--font-poppins) text-sm leading-6 text-[#8E8E8E]">
              {messages.footer.description}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.1em] text-[#F0F0F0]">
                  {column.title}
                </p>
                <div className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="block font-(family-name:--font-poppins) text-sm text-[#8E8E8E] transition-colors hover:text-[#FFD600]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/8 pt-6 font-(family-name:--font-poppins) text-xs text-[#717171] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 MsgFlash. Tous droits réservés.</span>
          <a
            href="https://www.website-24h.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#F0F0F0]"
          >
            {messages.footer.designCredit}
          </a>
        </div>
      </div>
    </footer>
  )
}
