"use client"

import { motion } from "framer-motion"
import { ArrowRight01Icon } from "hugeicons-react"
import Image from "next/image"
import { fadeUp, staggerContainer } from "../../lib/animations"
import { Button } from "../ui/Button"
import { landingBrand } from "../../lib/brand"

const USE_CASES = [
  {
    title: "Relance clients",
    text: "Débloquez vos paniers, vos rappels et vos confirmations directement sur WhatsApp.",
    image: "/relance.png",
    imageAlt: "Aperçu du cas d'usage de relance client sur WhatsApp",
  },
  {
    title: "Notifications commande",
    text: "Tenez vos clients au courant de chaque étape avec messages et réponses en temps réel.",
    image: "/notifs.png",
    imageAlt: "Aperçu du cas d'usage de notifications de commande sur WhatsApp",
  },
]

const PLANS = [
  {
    name: "Gratuit",
    price: "0€",
    desc: "Pour tester l’infrastructure et brancher un premier numéro.",
    cta: "Commencer",
    featured: false,
    features: [
      "1 instance",
      "20 messages / statuts par mois",
      "1 000 requêtes API / mois",
      "0 clé API",
      "0 endpoint webhook",
      "2 groupes de contacts",
      "Campagnes : non",
      "Statuts WhatsApp : non",
      "Webhooks : non",
      "Notes vocales : oui",
    ],
  },
  {
    name: "Starter",
    price: "9€",
    desc: "Pour lancer vos premiers automatismes en production.",
    cta: "Commencer",
    featured: false,
    features: [
      "1 instance",
      "5 000 messages / statuts par mois",
      "20 000 requêtes API / mois",
      "3 clés API",
      "3 endpoints webhook",
      "10 groupes de contacts",
      "Campagnes : oui",
      "Statuts WhatsApp : oui",
      "Webhooks : oui",
      "Notes vocales : oui",
    ],
  },
  {
    name: "Pro",
    price: "19€",
    desc: "Pour les équipes qui envoient plus, automatisent plus et monitorent mieux.",
    cta: "S’abonner",
    featured: true,
    features: [
      "5 instances",
      "25 000 messages / statuts par mois",
      "100 000 requêtes API / mois",
      "5 clés API",
      "10 endpoints webhook",
      "50 groupes de contacts",
      "Campagnes : oui",
      "Statuts WhatsApp : oui",
      "Webhooks : oui",
      "Notes vocales : oui",
    ],
  },
  {
    name: "Plus",
    price: "39€",
    desc: "Pour les volumes élevés, les workflows avancés et les opérations multi-numéros.",
    cta: "Contacter",
    featured: false,
    features: [
      "20 instances",
      "150 000 messages / statuts par mois",
      "500 000 requêtes API / mois",
      "10 clés API",
      "50 endpoints webhook",
      "Groupes de contacts illimités",
      "Campagnes : oui",
      "Statuts WhatsApp : oui",
      "Webhooks : oui",
      "Notes vocales : oui",
    ],
  },
]

const CODE_SAMPLE = `POST ${landingBrand.apiUrl}/messages/send
{
  "to": "+22900000000",
  "type": "text",
  "message": "Votre commande #123 est prête.",
  "instanceId": "main"
}`

interface PricingProps {}

export function Pricing({}: PricingProps) {
  return (
    <section id="tarifs" className="border-t border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h2 className="font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.5rem]">
            Cas d’usage concrets
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {USE_CASES.map((item, index) => (
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
              Pensé pour l’intégration dès le départ
            </h3>
            <p className="mt-4 max-w-xl font-(family-name:--font-poppins) text-sm leading-6 text-[#9D9D9D]">
              Une API REST lisible, sécurisée et performante. Stable à brancher avec vos backends,
              votre CRM, votre bot ou votre orchestrateur.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={landingBrand.docsUrl} size="sm">
                Lire la documentation
              </Button>
              <Button href={landingBrand.appUrl} variant="secondary" size="sm">
                Tester l’API
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
              <code>{CODE_SAMPLE}</code>
            </pre>
          </div>
        </div>

        <div className="mt-14">
          <div className="mb-8 flex flex-col gap-3 text-center">
            <h3 className="font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.5rem]">
              Des plans simples pour démarrer et évoluer
            </h3>
            <p className="font-(family-name:--font-poppins) text-sm text-[#9D9D9D]">
              Choisissez le volume qui correspond à votre croissance.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {PLANS.map((plan) => (
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
                        / mois
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
