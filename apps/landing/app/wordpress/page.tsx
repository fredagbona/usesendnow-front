import Image from "next/image"
import type { Metadata } from "next"
import { BubbleChatIcon, DeliveryTruck01Icon, Plug01Icon, Rocket01Icon, Ticket01Icon } from "hugeicons-react"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { ConfigurationSteps } from "../../components/sections/ConfigurationSteps"
import { Button } from "../../components/ui/Button"
import { BrandMark } from "../../components/shared/BrandMark"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"
import { getLandingMessages } from "../../lib/landing-i18n-data"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)

  return {
    title: `${messages.wordpress.title} - MsgFlash`,
    description: messages.wordpress.subtitle,
  }
}

export default async function WordPressPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)
  const useCases = [
    {
      title: locale === "en" ? "Cart recovery" : "Relance panier high-touch",
      action: locale === "en" ? "The customer leaves checkout." : "Le client quitte le checkout.",
      trigger: locale === "en" ? "Send a WhatsApp message after 45 minutes." : "Envoi d’un message WhatsApp après 45 minutes.",
      result: locale === "en" ? "+22% cart recovery without manual work." : "+22% de récupération de paniers sans effort manuel.",
      icon: BubbleChatIcon,
    },
    {
      title: locale === "en" ? "Instant order tracking" : "Suivi de commande instantané",
      action: locale === "en" ? "Order marked as shipped." : "Commande marquée comme expédiée.",
      trigger: locale === "en" ? "Automatically send the clickable tracking number." : "Envoi automatique du numéro de suivi cliquable.",
      result: locale === "en" ? "-40% fewer support tickets." : "-40% de tickets au support client.",
      icon: DeliveryTruck01Icon,
    },
    {
      title: locale === "en" ? "WhatsApp lead magnet" : "Lead magnet WhatsApp",
      action: locale === "en" ? "New customer signup." : "Nouveau client inscrit.",
      trigger: locale === "en" ? "Send a welcome promo code by WhatsApp." : "Envoi d’un code promo de bienvenue par WhatsApp.",
      result: locale === "en" ? "Coupon usage 3x higher than email." : "Taux d’utilisation du coupon 3x plus élevé que par email.",
      icon: Ticket01Icon,
    },
  ]

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
                  {messages.wordpress.title}
                </span>
              </div>
              <span className="font-(family-name:--font-geist-sans) text-2xl font-black text-[#F0F0F0]">×</span>
              <BrandMark textClassName="text-[#FFD600]" />
            </div>

            <div className="mt-8 mx-auto max-w-4xl text-center">
              <h1 className="font-(family-name:--font-geist-sans) text-[2.4rem] font-black uppercase leading-[0.92] tracking-[-0.05em] text-[#F0F0F0] sm:text-[3.6rem] lg:text-[4.4rem]">
                {messages.wordpress.hook}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl font-(family-name:--font-poppins) text-base leading-7 text-[#A7A7A7]">
                {messages.wordpress.description}
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button href="/msgflash-v1.0.0.zip" showArrow>
                  {messages.wordpress.primaryCta}
                </Button>
              </div>

              <div className="mt-10 border border-white/8 bg-[#111111] p-5 text-left">
                <p className="font-(family-name:--font-poppins) text-lg leading-8 text-[#D6D6D6]">
                  {messages.wordpress.hook}
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="border border-white/8 bg-[#101010] p-4 text-left">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                    {messages.wordpress.statsBoutiques}
                  </p>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#B0B0B0]">
                    {locale === "en"
                      ? "Use the msgflash infrastructure for WooCommerce automations."
                      : "utilisent l’infrastructure msgflash pour leurs automatisations WooCommerce."}
                  </p>
                </div>
                <div className="border border-white/8 bg-[#101010] p-4 text-left">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                    {messages.wordpress.statsMessages}
                  </p>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#B0B0B0]">
                    {locale === "en"
                      ? "Sent successfully for reminders, status updates, and revenue-driving follow-ups."
                      : "envoyés avec succès sur WooCommerce."}
                  </p>
                </div>
                <div className="border border-white/8 bg-[#101010] p-4 text-left">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                    {messages.wordpress.license}
                  </p>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#B0B0B0]">
                    WordPress Official Partner.
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
                {messages.wordpress.pillarsTitle}
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {useCases.map((item) => {
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
                        {item.result}
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
                {locale === "en" ? "Zero code, 100% power" : "Zéro code, 100% puissance"}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border border-white/8 bg-[#0F0F0F] p-4">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                    {locale === "en" ? "Installation" : "Installation"}
                  </p>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#B1B1B1]">
                    {locale === "en"
                      ? "Copy your API key, paste it into WordPress, enable notifications. That's it."
                      : "Copiez votre clé API, collez-la dans WordPress, activez vos notifications. C'est tout."}
                  </p>
                  <Plug01Icon className="mt-4 h-5 w-5 text-[#FFD600]" />
                </div>
                <div className="border border-white/8 bg-[#0F0F0F] p-4">
                  <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.12em] text-[#FFD600]">
                    {locale === "en" ? "Lightweight" : "Léger"}
                  </p>
                  <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#B1B1B1]">
                    {locale === "en"
                      ? "Our plugin weighs less than 1MB. Zero impact on your store speed and PageSpeed score."
                      : "Notre plugin pèse moins de 1Mo. Zéro impact sur la vitesse de votre boutique et votre score PageSpeed."}
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
              {locale === "en" ? "Ready to connect WordPress to WhatsApp?" : "Prêt à connecter WordPress à WhatsApp ?"}
            </h2>
            <div className="mt-6 flex items-center justify-between">
              <Button href="/msgflash-v1.0.0.zip" showArrow>
                {messages.wordpress.primaryCta}
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
