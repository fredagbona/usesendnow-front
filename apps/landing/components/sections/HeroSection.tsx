"use client"

import { motion } from "framer-motion"
import { fadeIn, fadeUp, staggerContainer } from "../../lib/animations"
import { Button } from "../ui/Button"
import { landingBrand } from "../../lib/brand"

const HERO_CONTENT = {
  title: "L’API WHATSAPP LA PLUS SIMPLE POUR LANCER VOS AUTOMATISATIONS",
  description:
    "Connectez un numéro WhatsApp, envoyez des messages, lancez des campagnes et intégrez vos outils favoris en quelques minutes.",
  primaryCta: "Commencer",
  secondaryCta: "Voir la documentation"
}

interface HeroSectionProps {}

export function HeroSection({}: HeroSectionProps) {
  return (
    <section className="border-b border-white/8 px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pb-20 lg:pt-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.h1
            variants={fadeUp}
            className="max-w-4xl font-(family-name:--font-geist-sans) text-[2.2rem] font-black uppercase leading-[0.92] tracking-[-0.05em] text-[#F0F0F0] sm:text-[3.4rem] lg:text-[4.4rem]"
          >
            {HERO_CONTENT.title}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl font-(family-name:--font-poppins) text-sm leading-6 text-[#A9A9A9] sm:text-base"
          >
            {HERO_CONTENT.description}
          </motion.p>

          <motion.div variants={fadeIn} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={`${landingBrand.appUrl}/signup`} showArrow>
              {HERO_CONTENT.primaryCta}
            </Button>
            <Button href={landingBrand.docsUrl} variant="secondary">
              {HERO_CONTENT.secondaryCta}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
