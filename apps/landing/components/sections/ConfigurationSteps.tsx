"use client"

import { motion } from "framer-motion"
import {
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  Link01Icon,
  Rocket01Icon,
  Settings02Icon,
  ShoppingCart02Icon,
  SmartPhone01Icon,
  ZapIcon,
} from "hugeicons-react"
import { fadeUp, staggerContainer } from "../../lib/animations"

const STEPS = [
  {
    number: "01",
    title: "Connectez votre compte",
    icon: Link01Icon,
    description: (
      <>
        Téléchargez le plugin msgflash depuis le répertoire officiel WordPress ou{" "}
        <a href="/msgflash-v1.0.0.zip" className="text-[#FFD600] underline underline-offset-2 hover:text-[#FFE044]">
          ici
        </a>
        . Une fois activé, collez votre Clé API unique (disponible depuis votre dashboard msgflash) pour lier votre instance WhatsApp à votre site.
      </>
    ),
  },
  {
    number: "02",
    title: "Optimisez votre Checkout",
    icon: ShoppingCart02Icon,
    description:
      "Pour garantir la livraison de vos messages, assurez-vous que vos clients renseignent leur numéro :",
    checklist: [
      "Allez dans Apparence > Personnaliser.",
      "Section WooCommerce > Validation de la commande ou Commander.",
      "Réglez le champ Téléphone sur \"Obligatoire\".",
      "Le plugin msgflash ajoutera automatiquement la mention \"(WhatsApp)\" pour rassurer vos clients.",
    ],
    badge: "Recommandé",
  },
  {
    number: "03",
    title: "Activez vos Triggers",
    icon: Settings02Icon,
    description: "Choisissez quels événements déclenchent un message :",
    triggers: [
      {
        label: "Panier abandonné",
        detail: "Relance automatique après 45 min.",
        icon: SmartPhone01Icon,
      },
      {
        label: "Nouvelle commande",
        detail: "Confirmation instantanée avec récapitulatif.",
        icon: CheckmarkCircle01Icon,
      },
      {
        label: "Expédition",
        detail: "Envoi du lien de suivi de colis en temps réel.",
        icon: Rocket01Icon,
      },
    ],
  },
]

const TIP = {
  icon: ZapIcon,
  label: "Le conseil msgflash",
  quote:
    "98% des messages WhatsApp sont lus dans les 3 minutes. En rendant le champ téléphone obligatoire, vous ne demandez pas juste un numéro, vous ouvrez un canal de vente directe qui convertit 5x mieux que l'email.",
}

interface ConfigurationStepsProps {}

export function ConfigurationSteps({}: ConfigurationStepsProps) {
  return (
    <section className="border-t border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 border border-[#FFD600]/25 bg-[#FFD600]/6 px-3 py-1.5">
            <ZapIcon className="h-4 w-4 text-[#FFD600]" />
            <span className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.14em] text-[#FFD600]">
              Configuration rapide
            </span>
          </div>
          <h2 className="mt-4 font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.5rem]">
            En 4 minutes chrono, activez WhatsApp sur votre boutique
          </h2>
          <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#9D9D9D]">
            Pas besoin d'être développeur. Suivez ces 3 étapes pour activer la puissance de WhatsApp sur votre boutique.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-5 lg:grid-cols-3"
        >
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="border border-white/8 bg-[#121212] p-5"
              >
                <div className="flex h-full flex-col justify-between gap-12">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="font-(family-name:--font-geist-sans) text-3xl font-black uppercase tracking-[-0.04em] text-[#FFD600]">
                        {step.number}
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded border border-[#FFD600]/30 bg-[#FFD600]/8">
                        <Icon className="h-4 w-4 text-[#FFD600]" />
                      </div>
                    </div>
                    <div className="mt-4 border-t border-[#FFD600] pt-4">
                      <h3 className="font-(family-name:--font-geist-sans) text-sm font-bold uppercase tracking-[0.08em] text-[#F0F0F0]">
                        {step.title}
                      </h3>
                      {typeof step.description === "string" ? (
                        <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#969696]">
                          {step.description}
                        </p>
                      ) : (
                        <div className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#969696]">
                          {step.description}
                        </div>
                      )}
                    </div>

                    {"badge" in step && step.badge && (
                      <div className="mt-3 inline-flex items-center gap-1.5 border border-[#FFD600]/20 bg-[#FFD600]/6 px-2.5 py-1">
                        <CheckmarkCircle01Icon className="h-3.5 w-3.5 text-[#FFD600]" />
                        <span className="font-(family-name:--font-geist-sans) text-[10px] font-bold uppercase tracking-[0.1em] text-[#FFD600]">
                          {step.badge}
                        </span>
                      </div>
                    )}

                    {"checklist" in step && step.checklist && (
                      <ul className="mt-4 space-y-2">
                        {step.checklist.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <ArrowRight01Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FFD600]" />
                            <span className="font-(family-name:--font-poppins) text-sm leading-6 text-[#B2B2B2]">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {"triggers" in step && step.triggers && (
                      <ul className="mt-4 space-y-3">
                        {step.triggers.map((trigger) => {
                          const TriggerIcon = trigger.icon
                          return (
                            <li key={trigger.label} className="flex items-start gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#FFD600]/20 bg-[#FFD600]/6">
                                <TriggerIcon className="h-3.5 w-3.5 text-[#FFD600]" />
                              </div>
                              <div>
                                <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.06em] text-[#F0F0F0]">
                                  {trigger.label}
                                </p>
                                <p className="mt-0.5 font-(family-name:--font-poppins) text-xs leading-5 text-[#9D9D9D]">
                                  {trigger.detail}
                                </p>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-10 border border-[#FFD600]/30 bg-[#FFD600]/4 p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFD600]">
              <TIP.icon className="h-4 w-4 text-[#0A0A0A]" />
            </div>
            <div>
              <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                {TIP.label}
              </p>
              <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 italic text-[#D8D8D8]">
                "{TIP.quote}"
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
