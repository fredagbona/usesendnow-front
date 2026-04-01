"use client"

import { Button } from "../ui/Button"
import { landingBrand } from "../../lib/brand"

const CTA_CONTENT = {
  title: "Prêt à connecter WhatsApp à votre produit ?",
  primary: "Créer un compte",
  secondary: "Voir la documentation",
}

interface FinalCTAProps {}

export function FinalCTA({}: FinalCTAProps) {
  return (
    <section className="mt-2 bg-[#FFD600] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <h2 className="max-w-3xl font-(family-name:--font-geist-sans) text-[2rem] font-black uppercase leading-[0.94] tracking-[-0.05em] text-[#0A0A0A] sm:text-[3rem]">
          {CTA_CONTENT.title}
        </h2>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href={`${landingBrand.appUrl}/signup`} variant="secondary" className="!border-[#0A0A0A] !text-[#0A0A0A] hover:!text-[#0A0A0A]">
            {CTA_CONTENT.primary}
          </Button>
          <Button href={landingBrand.docsUrl} variant="secondary" className="!border-[#0A0A0A] !text-[#0A0A0A] hover:!text-[#0A0A0A]">
            {CTA_CONTENT.secondary}
          </Button>
        </div>
      </div>
    </section>
  )
}
