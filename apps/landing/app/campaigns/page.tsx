import type { Metadata } from "next"
import { Megaphone01Icon, ChartHistogramIcon, Rocket01Icon, UserMultiple02Icon } from "hugeicons-react"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { Button } from "../../components/ui/Button"
import { landingBrand } from "../../lib/brand"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"
import { getLandingMessages } from "../../lib/landing-i18n-data"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)
  return {
    title: messages.campaigns.metaTitle,
    description: messages.campaigns.metaDescription,
  }
}

const blockIcons = [Megaphone01Icon, Rocket01Icon, UserMultiple02Icon, ChartHistogramIcon]

export default async function CampaignsPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)

  return (
    <>
      <Navbar />
      <main className="bg-[#0A0A0A] text-[#F0F0F0]">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.14),rgba(10,10,10,0)_42%),#0A0A0A] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="font-(family-name:--font-geist-sans) text-xs font-bold uppercase tracking-[0.14em] text-[#FFD600]">
              {messages.campaigns.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl font-(family-name:--font-geist-sans) text-[2.2rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[3.2rem] lg:text-[3.8rem]">
              {messages.campaigns.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl font-(family-name:--font-poppins) text-base leading-7 text-[#A7A7A7]">
              {messages.campaigns.heroLead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={`${landingBrand.appUrl}/signup`} showArrow>
                {messages.campaigns.primaryCta}
              </Button>
              <Button href={landingBrand.docsUrl} variant="secondary">
                {messages.campaigns.secondaryCta}
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 sm:grid-cols-2">
              {messages.campaigns.blocks.map((block, index) => {
                const Icon = blockIcons[index] ?? Megaphone01Icon
                return (
                  <article
                    key={block.title}
                    className="border border-white/8 bg-[#121212] p-6 sm:p-8"
                  >
                    <div className="inline-flex rounded-2xl border border-[#FFD600]/20 bg-[#FFD600]/8 p-3 text-[#FFD600]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h2 className="mt-5 font-(family-name:--font-geist-sans) text-lg font-black uppercase leading-tight tracking-[-0.03em] text-[#F0F0F0] sm:text-xl">
                      {block.title}
                    </h2>
                    <p className="mt-3 font-(family-name:--font-poppins) text-sm leading-7 text-[#A6A6A6] sm:text-base">
                      {block.body}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl border border-white/8 bg-[#121212] p-6 sm:p-8">
            <h2 className="font-(family-name:--font-geist-sans) text-[1.7rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#F0F0F0] sm:text-[2.1rem]">
              {messages.campaigns.closingTitle}
            </h2>
            <div className="mt-6">
              <Button href={`${landingBrand.appUrl}/signup`} showArrow>
                {messages.campaigns.primaryCta}
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
