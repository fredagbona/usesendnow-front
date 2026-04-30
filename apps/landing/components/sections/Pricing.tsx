"use client"

import { motion } from "framer-motion"
import { ArrowRight01Icon } from "hugeicons-react"
import Image from "next/image"
import { fadeUp, staggerContainer } from "../../lib/animations"
import { Button } from "../ui/Button"
import { landingBrand } from "../../lib/brand"
import { useLandingI18n } from "../../lib/landing-i18n"

interface PricingProps {}

export function Pricing({}: PricingProps) {
  const { messages, locale } = useLandingI18n()
  const useCases = messages.pricing.useCases.map((item, index) => ({
    ...item,
    image: index === 0 ? "/relance.png" : "/notifs.png",
  }))
  const plans = messages.pricing.plans.map((plan, index) => ({
    ...plan,
    featured: index === 2,
  }))
  const pricePerMonth = locale === "fr" ? "/ mois" : "/ month"

  return (
    <section className="border-t border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h2 className="font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.5rem]">
            {messages.pricing.useCasesTitle}
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {useCases.map((item, index) => (
            <div key={item.title} className="border border-white/8 bg-[#151515]">
              <div className="relative h-56 overflow-hidden border-b border-white/8 bg-[#0F0F0F] sm:h-64">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={[
                    "object-cover object-center",
                    index === 0 ? "sm:object-[center_35%]" : "sm:object-center",
                  ].join(" ")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
              </div>
              <div className="space-y-2 p-5">
                <p className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                  {item.title}
                </p>
                <p className="font-(family-name:--font-poppins) text-sm leading-6 text-[#969696]">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch">
          <div className="border border-white/8 bg-[#121212] p-6 sm:p-8">
            <h3 className="max-w-xl font-(family-name:--font-geist-sans) text-[1.8rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.3rem]">
              {messages.pricing.integrationTitle}
            </h3>
            <p className="mt-4 max-w-xl font-(family-name:--font-poppins) text-sm leading-6 text-[#9D9D9D]">
              {messages.pricing.integrationText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={landingBrand.docsUrl} size="sm">
                {messages.pricing.docsCta}
              </Button>
              <Button href={landingBrand.appUrl} variant="secondary" size="sm">
                {messages.pricing.apiCta}
              </Button>
            </div>
          </div>

          <div className="border border-[#FFD600] bg-[#0D0D0D]">
            <div className="flex items-center gap-2 border-b border-[#FFD600]/30 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-[#FFD600]" />
              <span className="h-2 w-2 rounded-full bg-[#4B4B4B]" />
              <span className="h-2 w-2 rounded-full bg-[#4B4B4B]" />
            </div>
            <pre className="overflow-x-auto px-4 py-5 font-mono text-xs leading-6 text-[#FFD600] sm:px-5">
              <code>{messages.pricing.codeSample}</code>
            </pre>
          </div>
        </div>

        <div id="tarifs" className="mt-14">
          <div className="mb-8 flex flex-col gap-3 text-center">
            <h3 className="font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.5rem]">
              {messages.pricing.title}
            </h3>
            <p className="font-(family-name:--font-poppins) text-sm text-[#9D9D9D]">
              {messages.pricing.subtitle}
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={[
                  "border p-5",
                  plan.featured ? "border-[#FFD600] bg-[#FFD600] text-[#0A0A0A]" : "border-white/8 bg-[#121212] text-[#F0F0F0]",
                ].join(" ")}
              >
                <div className="flex h-full flex-col">
                  <div className="border-t border-current/80 pt-4">
                    <p className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em]">
                      {plan.name}
                    </p>
                    <div className="mt-4 flex items-end gap-2">
                      <span className="font-(family-name:--font-geist-sans) text-4xl font-black tracking-[-0.05em]">
                        {plan.price}
                      </span>
                      <span className={plan.featured ? "pb-1 font-(family-name:--font-poppins) text-xs text-[#3A3100]" : "pb-1 font-(family-name:--font-poppins) text-xs text-[#8D8D8D]"}>
                        {pricePerMonth}
                      </span>
                    </div>
                    <p className={plan.featured ? "mt-2 font-(family-name:--font-poppins) text-sm text-[#3A3100]" : "mt-2 font-(family-name:--font-poppins) text-sm text-[#9D9D9D]"}>
                      {plan.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <ArrowRight01Icon className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className={plan.featured ? "font-(family-name:--font-poppins) text-sm text-[#1F1A00]" : "font-(family-name:--font-poppins) text-sm text-[#B2B2B2]"}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    href={`${landingBrand.appUrl}/signup`}
                    variant={plan.featured ? "secondary" : "primary"}
                    size="sm"
                    className={plan.featured ? "mt-8 w-full !border-[#0A0A0A] !text-[#0A0A0A] hover:!text-[#0A0A0A] hover:!border-[#0A0A0A]" : "mt-8 w-full justify-center"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
