"use client"

import { landingBrand } from "../../lib/brand"
import { BrandMark } from "../shared/BrandMark"
import { useLandingI18n } from "../../lib/landing-i18n"
import { getLandingV2Copy } from "../../lib/landing-v2-copy"

interface FooterProps {}

export function Footer({}: FooterProps) {
  const { locale } = useLandingI18n()
  const copy = getLandingV2Copy(locale)

  const columns = [
    {
      title: copy.footer.product,
      links: [
        { label: copy.footer.links.features, href: "/product" },
        { label: copy.footer.links.security, href: "/security" },
        { label: copy.footer.links.whatsappApi, href: "/product/api" },
        { label: copy.footer.links.pricing, href: "/#pricing" },
      ],
    },
    {
      title: copy.footer.useCases,
      links: [
        { label: copy.footer.links.woocommerce, href: "/solutions/woocommerce" },
        { label: copy.footer.links.saas, href: "/solutions/saas" },
        { label: copy.footer.links.sales, href: "/solutions/sales" },
        { label: copy.footer.links.appointments, href: "/solutions/appointments" },
        { label: copy.footer.links.campaigns, href: "/product/campaigns" },
      ],
    },
    {
      title: copy.footer.integrations,
      links: [
        { label: copy.footer.links.integrations, href: "/integrations" },
        { label: copy.footer.links.api, href: "/integrations/api" },
        { label: copy.footer.links.webhooks, href: "/integrations/webhooks" },
        { label: copy.footer.links.wordpress, href: landingBrand.wordpressPluginUrl, external: true },
      ],
    },
    {
      title: copy.footer.resources,
      links: [
        { label: copy.footer.links.docs, href: landingBrand.docsUrl },
        { label: copy.footer.links.announcements, href: "/announcements" },
        { label: copy.footer.links.blog, href: landingBrand.blogUrl, external: true },
        { label: copy.footer.links.status, href: "https://msgflash.instatus.com/", external: true },
        { label: copy.footer.links.faq, href: "/#faq" },
      ],
    },
    {
      title: copy.footer.company,
      links: [
        { label: copy.footer.links.contact, href: "/contact" },
        { label: copy.footer.links.privacy, href: "/politique-confidentialite" },
        { label: copy.footer.links.terms, href: "/conditions-utilisation" },
      ],
    },
  ]

  return (
    <footer className="border-t border-black/10 bg-[#FBF7EE] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="space-y-4">
            <BrandMark textClassName="text-[#171515]" />
            <p className="max-w-sm font-(family-name:--font-poppins) text-sm leading-6 text-[#6F685F]">
              {copy.footer.description}
            </p>
            <a
              href="/#demo"
              className="inline-flex rounded-sm border border-black/10 bg-white px-4 py-2 font-(family-name:--font-geist-sans) text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171515] shadow-[0_10px_30px_rgba(23,21,21,0.05)]"
            >
              {copy.footer.links.bookDemo}
            </a>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-5">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.14em] text-[#171515]">
                  {column.title}
                </p>
                <div className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <a
                      key={`${column.title}-${link.href}`}
                      href={link.href}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="block font-(family-name:--font-poppins) text-sm text-[#6F685F] transition-colors hover:text-[#171515]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-black/10 pt-6 font-(family-name:--font-poppins) text-xs text-[#8A8177] sm:flex-row sm:items-center sm:justify-between">
          <span>{copy.footer.copyright}</span>
          <span>{landingBrand.tagline}</span>
        </div>
      </div>
    </footer>
  )
}
