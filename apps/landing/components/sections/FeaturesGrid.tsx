"use client"

import { motion } from "framer-motion"
import {
  ArrowRight01Icon,
  BubbleChatIcon,
  Calendar02Icon,
  FlowConnectionIcon,
  Megaphone01Icon,
  Notification03Icon,
} from "hugeicons-react"
import { fadeUp, staggerContainer } from "../../lib/animations"
import { useLandingI18n } from "../../lib/landing-i18n"

interface FeaturesGridProps {}

export function FeaturesGrid({}: FeaturesGridProps) {
  const { messages } = useLandingI18n()
  const featureCards = [
    { ...messages.features.cards[0], icon: BubbleChatIcon },
    { ...messages.features.cards[1], icon: Calendar02Icon },
    { ...messages.features.cards[2], icon: Megaphone01Icon },
    { ...messages.features.cards[3], icon: Notification03Icon },
    { ...messages.features.cards[4], icon: FlowConnectionIcon },
  ]

  return (
    <section id="fonctionnalites" className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h2 className="max-w-3xl font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.6rem]">
            {messages.features.title}
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {featureCards.map(({ title, description, icon: Icon }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="border border-white/8 bg-[#121212] p-5"
            >
              <div className="flex h-full flex-col justify-between gap-10">
                <div className="flex h-14 w-14 items-center justify-center border border-[#FFD600]/20 bg-[#FFD600]/6 text-[#FFD600]">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="border-t border-[#FFD600] pt-4">
                  <h3 className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                    {title}
                  </h3>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#969696]">
                    {description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <h3 className="max-w-xl font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.5rem]">
              {messages.features.reasonsTitle}
            </h3>
          </div>
          <div className="border border-white/8 bg-[#171717] p-6">
            <div className="space-y-5">
              {messages.features.reasons.map((item) => (
                <div key={item.title} className="border-b border-white/8 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <ArrowRight01Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD600]" />
                    <div>
                      <p className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                        {item.title}
                      </p>
                      <p className="mt-1 font-(family-name:--font-poppins) text-sm leading-6 text-[#9A9A9A]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
