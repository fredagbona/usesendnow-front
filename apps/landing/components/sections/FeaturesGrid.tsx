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

const FEATURE_CARDS = [
  {
    title: "Envoyer des messages",
    description: "Un point unique pour vos messages textuels, médias et réponses simples.",
    icon: BubbleChatIcon,
  },
  {
    title: "Planifier des envois",
    description: "Déclenchez vos campagnes et vos rappels depuis une API claire et rapide.",
    icon: Calendar02Icon,
  },
  {
    title: "Lancer des campagnes",
    description: "Gérez vos listes de diffusion et suivez les performances en temps réel.",
    icon: Megaphone01Icon,
  },
  {
    title: "Recevoir des événements",
    description: "Récupérez vos webhooks pour chaque livraison ou réponse utilisateur.",
    icon: Notification03Icon,
  },
  {
    title: "Connecter vos outils",
    description: "Branchez votre backend, n8n, Zapier, Make ou vos workflows internes sans friction.",
    icon: FlowConnectionIcon,
  },
]

const PLATFORM_REASONS = [
  { title: "API simple", text: "Une documentation claire et des endpoints directs, sans détour." },
  { title: "Connexion rapide", text: "Scannez le QR Code et mettez votre intégration en ligne rapidement." },
  { title: "Webhooks utiles", text: "Recevez les livraisons, réponses et erreurs dès qu'elles arrivent." },
  { title: "Pensé pour les makers", text: "Compatible avec vos outils backend, no-code et automatisations." },
  { title: "Tarification lisible", text: "Pas de licence cachée, pas de surcoût de plateforme surprise." },
  { title: "Trajectoire solide", text: "Pour un bot simple, une campagne ou un orchestrateur plus complet." },
]

interface FeaturesGridProps {}

export function FeaturesGrid({}: FeaturesGridProps) {
  return (
    <section id="fonctionnalites" className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h2 className="max-w-3xl font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.6rem]">
            Construisez rapidement vos automatisations WhatsApp
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {FEATURE_CARDS.map(({ title, description, icon: Icon }) => (
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
              Pourquoi utiliser notre plateforme plutôt que bricoler ?
            </h3>
          </div>
          <div className="border border-white/8 bg-[#171717] p-6">
            <div className="space-y-5">
              {PLATFORM_REASONS.map((item) => (
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
