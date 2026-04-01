"use client"

import { motion } from "framer-motion"
import { fadeIn } from "../../lib/animations"

const TRUST_ITEMS = [
  "API REST simple",
  "Webhook events",
  "Messages texte + médias",
  "Connexion rapide",
]

interface LogosBarProps {}

export function LogosBar({}: LogosBarProps) {
  return (
    <section className="border-b border-white/8 px-4 py-5 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        variants={fadeIn}
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"
      >
        {TRUST_ITEMS.map((item) => (
          <div
            key={item}
            className="min-w-[140px] flex-1 border border-white/8 bg-[#121212] px-4 py-3 text-center font-(family-name:--font-poppins) text-[10px] uppercase tracking-[0.14em] text-[#8A8A8A] sm:text-[11px]"
          >
            {item}
          </div>
        ))}
      </motion.div>
    </section>
  )
}
