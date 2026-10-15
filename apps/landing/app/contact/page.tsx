import type { Metadata } from "next"
import { Button } from "../../components/ui/Button"
import { Footer } from "../../components/sections/Footer"
import { Navbar } from "../../components/sections/Navbar"
import { landingBrand } from "../../lib/brand"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"
import { getLandingMessages } from "../../lib/landing-i18n-data"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)

  return {
    title: `${messages.contact.badge} - MsgFlash`,
    description: messages.contact.subtitle,
  }
}

export default async function ContactPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const messages = getLandingMessages(locale)

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#FCFAF4] text-[#171515]">
        <section className="border-b border-black/10 bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.16),rgba(252,250,244,0)_36%),#FCFAF4] px-6 pb-16 pt-28 sm:pt-32">
          <div className="mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-2 rounded-sm border border-black/10 bg-white px-3 py-1.5 font-(family-name:--font-poppins) text-[11px] uppercase tracking-[0.14em] text-[#A18A00] shadow-[0_8px_24px_rgba(23,21,21,0.05)]">
              {messages.contact.badge}
            </div>
            <h1 className="mt-6 max-w-4xl font-(family-name:--font-geist-sans) text-4xl font-semibold tracking-[-0.06em] text-[#171515] sm:text-5xl md:text-6xl">
              {messages.contact.title}
            </h1>
            <p className="mt-5 max-w-3xl font-(family-name:--font-poppins) text-base leading-7 text-[#625B54]">
              {messages.contact.subtitle}
            </p>
          </div>
        </section>

        <section className="px-6 py-14 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
            <div className="space-y-4">
              <div className="rounded-sm border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(23,21,21,0.06)]">
                <h2 className="mb-3 font-(family-name:--font-geist-sans) text-lg font-semibold text-[#171515]">
                  {messages.contact.emailDirect}
                </h2>
                <a href={`mailto:${landingBrand.helloEmail}`} className="font-(family-name:--font-poppins) text-sm font-medium text-[#A18A00] transition-colors hover:text-[#6F5C00]">
                  {landingBrand.helloEmail}
                </a>
                <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#625B54]">{messages.contact.supportText}</p>
              </div>

              <div className="rounded-sm border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(23,21,21,0.06)]">
                <h2 className="mb-3 font-(family-name:--font-geist-sans) text-lg font-semibold text-[#171515]">
                  {messages.contact.support}
                </h2>
                <a href={`mailto:${landingBrand.supportEmail}`} className="font-(family-name:--font-poppins) text-sm font-medium text-[#A18A00] transition-colors hover:text-[#6F5C00]">
                  {landingBrand.supportEmail}
                </a>
                <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#625B54]">{messages.contact.responseText}</p>
              </div>

              <div className="rounded-sm border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(23,21,21,0.06)]">
                <h2 className="mb-3 font-(family-name:--font-geist-sans) text-lg font-semibold text-[#171515]">
                  {messages.contact.docs}
                </h2>
                <p className="mb-4 font-(family-name:--font-poppins) text-sm leading-6 text-[#625B54]">{messages.contact.docsText}</p>
                <Button href={landingBrand.docsUrl} variant="secondary" size="sm">
                  {messages.contact.docs}
                </Button>
              </div>
            </div>

            <div className="rounded-sm border border-black/10 bg-white p-6 sm:p-8 shadow-[0_24px_80px_rgba(23,21,21,0.06)]">
              <div className="mb-6">
                <h2 className="font-(family-name:--font-geist-sans) text-2xl font-semibold tracking-[-0.03em] text-[#171515]">
                  {messages.contact.writeUs}
                </h2>
                <p className="mt-3 font-(family-name:--font-poppins) text-sm leading-6 text-[#625B54]">{messages.contact.formDescription}</p>
              </div>

              <form className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-widest text-[#7A7268]">{messages.contact.firstName}</label>
                    <input type="text" placeholder="Jean Dupont" required className="rounded-sm border border-black/10 bg-[#FCFAF4] px-4 py-3 text-sm font-(family-name:--font-poppins) text-[#171515] placeholder:text-[#8A8177] transition-colors focus:border-[#A18A00] focus:outline-none focus:ring-2 focus:ring-[#A18A00]/15" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-widest text-[#7A7268]">{messages.contact.email}</label>
                    <input type="email" placeholder="vous@exemple.com" required className="rounded-sm border border-black/10 bg-[#FCFAF4] px-4 py-3 text-sm font-(family-name:--font-poppins) text-[#171515] placeholder:text-[#8A8177] transition-colors focus:border-[#A18A00] focus:outline-none focus:ring-2 focus:ring-[#A18A00]/15" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-widest text-[#7A7268]">{messages.contact.subject}</label>
                  <select required className="rounded-sm border border-black/10 bg-[#FCFAF4] px-4 py-3 text-sm font-(family-name:--font-poppins) text-[#171515] transition-colors focus:border-[#A18A00] focus:outline-none focus:ring-2 focus:ring-[#A18A00]/15">
                    {messages.contact.subjectOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-widest text-[#7A7268]">{messages.contact.message}</label>
                  <textarea rows={6} placeholder="Décrivez votre demande en détail..." required className="resize-none rounded-sm border border-black/10 bg-[#FCFAF4] px-4 py-3 text-sm font-(family-name:--font-poppins) text-[#171515] placeholder:text-[#8A8177] transition-colors focus:border-[#A18A00] focus:outline-none focus:ring-2 focus:ring-[#A18A00]/15" />
                </div>

                <button type="submit" className="w-full rounded-sm border border-[#D7B800] bg-[#FFD600] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#171515] transition-colors hover:bg-[#FFE04A]">
                  {messages.contact.submit}
                </button>

                <p className="text-center font-(family-name:--font-poppins) text-xs leading-6 text-[#7A7268]">
                  En soumettant ce formulaire, vous acceptez notre <a href="/politique-confidentialite" className="text-[#FFD600] transition-colors hover:text-[#FFF0A6]">{messages.contact.privacy}</a>.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
