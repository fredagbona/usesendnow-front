"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight01Icon } from "hugeicons-react"
import { fadeUp, staggerContainer } from "../../lib/animations"

const FEATURE_CARDS = [
  {
    title: "Envoyer des messages",
    description: "Un point unique pour vos messages textuels, médias et réponses simples.",
    image: "/messages.png",
    imageAlt: "Interface d'envoi de messages WhatsApp",
  },
  {
    title: "Planifier des envois",
    description: "Déclenchez vos campagnes et vos rappels depuis une API claire et rapide.",
    image: "/planification.png",
    imageAlt: "Interface de planification d'envois WhatsApp",
  },
  {
    title: "Lancer des campagnes",
    description: "Gérez vos listes de diffusion et suivez les performances en temps réel.",
    image: "/campagnes.png",
    imageAlt: "Interface de campagnes WhatsApp",
  },
  {
    title: "Recevoir des événements",
    description: "Récupérez vos webhooks pour chaque livraison ou réponse utilisateur.",
    image: "/webhooks.png",
    imageAlt: "Interface de webhooks et événements",
  },
  {
    title: "Connecter vos outils",
    description: "Branchez votre backend, n8n, Zapier, Make ou vos workflows internes sans friction.",
    image: "/apis.png",
    imageAlt: "Interface d'intégration API et outils externes",
  },
]

const PLATFORM_REASONS = [
  { title: "API simple", text: "Une documentation claire et des endpoints directs, sans détour." },
  { title: "Connexion rapide", text: "Scannez le QR Code et mettez votre intégration en ligne rapidement." },
  { title: "Webhooks utiles", text: "Recevez les livraisons, réponses et erreurs dès qu’elles arrivent." },
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
          className="grid gap-5 lg:grid-cols-2"
        >
          {FEATURE_CARDS.map(({ title, description, image, imageAlt }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="overflow-hidden border border-white/8 bg-[#171717] text-[#F0F0F0]"
            >
              <div className="relative h-56 overflow-hidden border-b border-white/8 bg-[#0F0F0F] sm:h-64">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
              </div>
              <div className="space-y-2 p-5">
                <p className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                  {title}
                </p>
                <p className="font-(family-name:--font-poppins) text-sm leading-6 text-[#9D9D9D]">
                  {description}
                </p>
                <div className="h-px w-14 bg-[#FFD600]" />
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
