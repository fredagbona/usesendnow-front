"use client"

import { motion } from "framer-motion"
import {
  InvoiceIcon,
  Message01Icon,
  SmartPhone01Icon,
  UserGroupIcon,
} from "hugeicons-react"
import { fadeUp, staggerContainer } from "../../lib/animations"

const STEPS = [
  { number: "01", title: "Créez votre compte", text: "Inscription rapide, dashboard clair." },
  { number: "02", title: "Connectez un numéro", text: "Lecture du QR Code standard." },
  { number: "03", title: "Intégrez notre API", text: "Une route simple pour POST, GET et webhooks." },
  { number: "04", title: "Lancez l’automatisation", text: "Envoyez vos messages et suivez les réponses." },
]

const AUDIENCES = [
  { label: "Makers", icon: SmartPhone01Icon },
  { label: "Agences", icon: UserGroupIcon },
  { label: "E-commerçants", icon: InvoiceIcon },
  { label: "Développeurs", icon: Message01Icon },
]

interface HowItWorksProps {}

export function HowItWorks({}: HowItWorksProps) {
  return (
    <section className="border-t border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h2 className="font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.5rem]">
            Comment ça marche ?
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {STEPS.map((step) => (
            <motion.div key={step.number} variants={fadeUp} className="border border-white/8 bg-[#121212] p-5">
              <div className="flex h-full flex-col justify-between gap-12">
                <div className="font-(family-name:--font-geist-sans) text-3xl font-black uppercase tracking-[-0.04em] text-[#FFD600]">
                  {step.number}
                </div>
                <div className="border-t border-[#FFD600] pt-4">
                  <h3 className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#969696]">
                    {step.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-14 border border-white/8 bg-[#121212] px-5 py-8 sm:px-8">
          <h3 className="font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.4rem]">
            Conçu pour ceux qui veulent aller vite
          </h3>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AUDIENCES.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 border border-white/8 bg-[#171717] px-4 py-5 text-center"
              >
                <Icon className="h-5 w-5 text-[#F0F0F0]" />
                <span className="font-(family-name:--font-geist-sans) text-[11px] font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
