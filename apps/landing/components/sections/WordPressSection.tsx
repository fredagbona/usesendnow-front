"use client"

import Image from "next/image"
import {
  BubbleChatIcon,
  Coupon01Icon,
  PackageSearchIcon,
} from "hugeicons-react"
import { Button } from "../ui/Button"
import { BrandMark } from "../shared/BrandMark"
import { landingBrand } from "../../lib/brand"

const PILLARS = [
  {
    eyebrow: "Relance panier",
    title: "Relance panier \"high-touch\"",
    description:
      "Déclenchement automatique 45 minutes après abandon de checkout pour récupérer vos ventes sans action manuelle.",
    result: "+22% de récupération de paniers",
    icon: BubbleChatIcon,
  },
  {
    eyebrow: "Suivi expédition",
    title: "Suivi de commande instantané",
    description:
      "Dès qu'une commande passe en expédiée, le client reçoit son numéro de suivi cliquable sur WhatsApp.",
    result: "-40% de tickets \"Où est mon colis ?\"",
    icon: PackageSearchIcon,
  },
  {
    eyebrow: "Coupon bienvenue",
    title: "Lead magnet WhatsApp",
    description:
      "À chaque nouvelle inscription client, envoyez automatiquement un coupon de bienvenue directement dans WhatsApp.",
    result: "3x plus d'utilisation qu'un coupon email",
    icon: Coupon01Icon,
  },
] as const

interface WordPressSectionProps {}

export function WordPressSection({}: WordPressSectionProps) {
  return (
    <section className="border-t border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden border border-white/8 bg-[#121212]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_420px]">
            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <div className="inline-flex items-center gap-3 border border-[#FFD600]/25 bg-[#FFD600]/6 px-4 py-2">
                <Image src="/logo-wp.png" alt="WordPress" width={24} height={24} className="h-6 w-6 object-contain" />
                <span className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.14em] text-[#FFD600]">
                  WordPress x msgflash
                </span>
              </div>

              <h2 className="mt-6 max-w-3xl font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.8rem]">
                Le plugin WordPress qui transforme WooCommerce en canal WhatsApp piloté par revenu.
              </h2>
              <p className="mt-4 max-w-2xl font-(family-name:--font-poppins) text-sm leading-7 text-[#A3A3A3] sm:text-base">
                Branchez msgflash à votre boutique, déclenchez vos relances panier, vos suivis de commande et vos coupons de bienvenue
                sans écrire de code. Installation rapide, plugin léger, impact direct sur votre conversion.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={landingBrand.wordpressUrl} showArrow>
                  Voir la page WordPress
                </Button>
                <Button href={`${landingBrand.appUrl}/signup`} variant="secondary">
                  Créer un compte gratuit
                </Button>
              </div>
            </div>

            <div className="border-t border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.18),rgba(10,10,10,0)_42%),#0D0D0D] px-6 py-8 lg:border-l lg:border-t-0">
              <div className="rounded-[28px] border border-white/8 bg-[#161616] p-5">
                <div className="flex items-center gap-3">
                  <Image src="/logo-wp.png" alt="WordPress" width={34} height={34} className="h-8 w-8 object-contain" />
                  <span className="font-(family-name:--font-geist-sans) text-xl font-black text-[#F0F0F0]">×</span>
                  <BrandMark textClassName="text-[#FFD600]" />
                </div>
                <div className="mt-6 grid gap-3">
                  <div className="border border-[#FFD600]/25 bg-[#FFD600]/8 p-4">
                    <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                      Déjà 1 237 boutiques
                    </p>
                    <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#D8D8D8]">
                      utilisent l'infrastructure msgflash pour leurs automatisations WooCommerce.
                    </p>
                  </div>
                  <div className="border border-white/8 bg-[#101010] p-4">
                    <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#F0F0F0]">
                      41 237 messages / 24h
                    </p>
                    <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#A3A3A3]">
                      envoyés avec succès pour les rappels, statuts de commande et relances à forte marge.
                    </p>
                  </div>
                  <div className="inline-flex w-fit items-center gap-2 border border-white/8 bg-[#0B0B0B] px-3 py-2 font-(family-name:--font-geist-sans) text-[11px] font-bold uppercase tracking-[0.12em] text-[#E9E9E9]">
                    GPL v2 Licensed
                    <span className="text-[#FFD600]">•</span>
                    WordPress Official Partner
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 px-6 py-6 sm:px-8">
            <div className="grid gap-5 lg:grid-cols-3">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon
                return (
                <article key={pillar.title} className="border border-white/8 bg-[#151515]">
                  <div className="border-b border-white/8 bg-[#0F0F0F] p-6">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded border border-[#FFD600]/20 bg-[#FFD600]/6 text-[#FFD600]">
                      <Icon className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="space-y-3 p-5">
                    <p className="font-(family-name:--font-geist-sans) text-[11px] font-bold uppercase tracking-[0.14em] text-[#FFD600]">
                      {pillar.eyebrow}
                    </p>
                    <h3 className="font-(family-name:--font-geist-sans) text-lg font-black uppercase leading-tight tracking-[-0.03em] text-[#F0F0F0]">
                      {pillar.title}
                    </h3>
                    <p className="font-(family-name:--font-poppins) text-sm leading-6 text-[#A1A1A1]">
                      {pillar.description}
                    </p>
                    <div className="border border-[#FFD600]/20 bg-[#FFD600]/6 px-3 py-2 font-(family-name:--font-poppins) text-sm font-medium text-[#FFF0A6]">
                      {pillar.result}
                    </div>
                  </div>
                </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
