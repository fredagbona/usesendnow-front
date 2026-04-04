import Image from "next/image"
import type { Metadata } from "next"
import {
  BubbleChatIcon,
  DeliveryTruck01Icon,
  Ticket01Icon,
  Plug01Icon,
  Rocket01Icon,
} from "hugeicons-react"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { ConfigurationSteps } from "../../components/sections/ConfigurationSteps"
import { Button } from "../../components/ui/Button"
import { BrandMark } from "../../components/shared/BrandMark"

const USE_CASES = [
  {
    title: "La relance panier high-touch",
    action: "Le client quitte le checkout.",
    trigger: "Envoi d’un message WhatsApp après 45 minutes.",
    result: "+22% de récupération de paniers sans effort manuel.",
    icon: BubbleChatIcon,
  },
  {
    title: "Le suivi de commande instant",
    action: "Commande marquée comme expédiée.",
    trigger: "Envoi automatique du numéro de suivi cliquable.",
    result: "-40% de tickets au support client.",
    icon: DeliveryTruck01Icon,
  },
  {
    title: "Le lead magnet WhatsApp",
    action: "Nouveau client inscrit.",
    trigger: "Envoi d’un code promo de bienvenue par WhatsApp.",
    result: "Taux d’utilisation du coupon 3x plus élevé que par email.",
    icon: Ticket01Icon,
  },
] as const

export const metadata: Metadata = {
  title: "WordPress x MsgFlash",
  description: "Connectez WooCommerce à MsgFlash pour relancer, notifier et convertir via WhatsApp.",
}

export default function WordPressPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#0A0A0A] text-[#F0F0F0]">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.16),rgba(10,10,10,0)_40%),#0A0A0A] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="inline-flex items-center gap-3 border border-[#FFD600]/25 bg-[#FFD600]/6 px-4 py-2">
                <Image src="/logo-wp.png" alt="WordPress" width={28} height={28} className="h-7 w-7 object-contain" />
                <span className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.14em] text-[#FFD600]">
                  WordPress
                </span>
              </div>
              <span className="font-(family-name:--font-geist-sans) text-2xl font-black text-[#F0F0F0]">×</span>
              <BrandMark textClassName="text-[#FFD600]" />
            </div>

            <div className="mt-8 mx-auto max-w-4xl text-center">
              <h1 className="font-(family-name:--font-geist-sans) text-[2.4rem] font-black uppercase leading-[0.92] tracking-[-0.05em] text-[#F0F0F0] sm:text-[3.6rem] lg:text-[4.4rem]">
                L&apos;ancien marketing WooCommerce est mort. Récupérez 15% de votre CA via WhatsApp.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl font-(family-name:--font-poppins) text-base leading-7 text-[#A7A7A7]">
                Ne laissez plus vos paniers abandonnés au hasard des emails. Connectez <strong className="text-[#F0F0F0]">msgflash</strong> à votre boutique en 4 minutes 27 secondes.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button href="/msgflash-v1.0.0.zip" showArrow>
                  Télécharger le Plugin (Gratuit)
                </Button>
              </div>

              <div className="mt-10 border border-white/8 bg-[#111111] p-5 text-left">
                <p className="font-(family-name:--font-poppins) text-lg leading-8 text-[#D6D6D6]">
                  “Le problème n&apos;est pas votre trafic, c&apos;est votre taux de rétention. 91% des clients ignorent vos emails transactionnels.
                  Avec msgflash, vous entrez directement dans leur poche.”
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="border border-white/8 bg-[#101010] p-4 text-left">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                    Déjà 1 237 boutiques
                  </p>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#B0B0B0]">
                    utilisent l’infrastructure msgflash.
                  </p>
                </div>
                <div className="border border-white/8 bg-[#101010] p-4 text-left">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                    41 237 messages / 24h
                  </p>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#B0B0B0]">
                    envoyés avec succès sur WooCommerce.
                  </p>
                </div>
                <div className="border border-white/8 bg-[#101010] p-4 text-left">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                    Plugin officiel
                  </p>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#B0B0B0]">
                    GPL v2 Licensed • WordPress Official Partner.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="font-(family-name:--font-geist-sans) text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.8rem]">
                Les 3 cas d’usage qui paient le plugin
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {USE_CASES.map((item) => {
                const Icon = item.icon
                return (
                <article key={item.title} className="overflow-hidden border border-white/8 bg-[#151515]">
                  <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.16),rgba(21,21,21,0)_60%),#0F0F0F] p-6">
                    <div className="inline-flex rounded-2xl border border-[#FFD600]/20 bg-[#FFD600]/8 p-4 text-[#FFD600]">
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="space-y-3 p-5">
                    <h3 className="font-(family-name:--font-geist-sans) text-lg font-black uppercase leading-tight tracking-[-0.03em] text-[#F0F0F0]">
                      {item.title}
                    </h3>
                    <div className="space-y-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#A6A6A6]">
                      <p><strong className="text-[#F0F0F0]">Action :</strong> {item.action}</p>
                      <p><strong className="text-[#F0F0F0]">Trigger :</strong> {item.trigger}</p>
                    </div>
                    <div className="border border-[#FFD600]/20 bg-[#FFD600]/6 px-3 py-2 font-(family-name:--font-poppins) text-sm font-medium text-[#FFF0A6]">
                      Résultat : {item.result}
                    </div>
                  </div>
                </article>
                )
              })}
            </div>
          </div>
        </section>

        <ConfigurationSteps />

        <section className="border-b border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="border border-white/8 bg-[#121212] p-6 sm:p-8">
              <h2 className="font-(family-name:--font-geist-sans) text-[1.8rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.3rem]">
                Zéro code, 100% puissance
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border border-white/8 bg-[#0F0F0F] p-4">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                    Installation
                  </p>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#B1B1B1]">
                    Copiez votre clé API, collez-la dans WordPress, activez vos notifications. C'est tout.
                  </p>
                  <Plug01Icon className="mt-4 h-5 w-5 text-[#FFD600]" />
                </div>
                <div className="border border-white/8 bg-[#0F0F0F] p-4">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                    Léger
                  </p>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#B1B1B1]">
                    Notre plugin pèse moins de 1Mo. Zéro impact sur la vitesse de votre boutique et votre score PageSpeed.
                  </p>
                  <Rocket01Icon className="mt-4 h-5 w-5 text-[#FFD600]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl border border-white/8 bg-[#121212] p-6 sm:p-8">
            <h2 className="font-(family-name:--font-geist-sans) text-[1.8rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.2rem]">
              Prêt à connecter WordPress à WhatsApp ?
            </h2>
            <div className="mt-6 flex items-center justify-between">
              <Button href="/msgflash-v1.0.0.zip" showArrow>
                Télécharger le Plugin (Gratuit)
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
