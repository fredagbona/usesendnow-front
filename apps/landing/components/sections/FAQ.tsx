"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDown01Icon } from "hugeicons-react"
import { useLandingI18n } from "../../lib/landing-i18n"

interface FAQProps {}

export function FAQ({}: FAQProps) {
  const { messages } = useLandingI18n()
  const [open, setOpen] = useState<string>(messages.faq.items[0].question)

  return (
    <section id="faq" className="border-t border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.5rem]">
            {messages.faq.title}
          </h2>
        </div>

        <div className="border border-white/8 bg-[#121212]">
          {messages.faq.items.map((item, index) => {
            const active = open === item.question

            return (
              <div key={item.question} className={index === messages.faq.items.length - 1 ? "" : "border-b border-white/8"}>
                <button
                  type="button"
                  onClick={() => setOpen(active ? "" : item.question)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                    {item.question}
                  </span>
                  <ArrowDown01Icon className={["h-4 w-4 shrink-0 text-[#F0F0F0] transition-transform", active ? "rotate-180" : ""].join(" ")} />
                </button>

                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 font-(family-name:--font-poppins) text-sm leading-6 text-[#9A9A9A]">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
