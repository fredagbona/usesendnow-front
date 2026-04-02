import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { Metadata } from "next"
import { landingBrand } from "../../lib/brand"
import { Button } from "../../components/ui/Button"

export const metadata: Metadata = {
  title: "Contact - MsgFlash",
  description: "Contactez l'équipe MsgFlash pour toute question sur notre infrastructure WhatsApp.",
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#0A0A0A] text-[#F0F0F0]">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,214,0,0.14),rgba(10,10,10,0)_36%),#0A0A0A] px-6 pb-16 pt-32">
          <div className="mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-2 border border-[#FFD600]/30 bg-[#FFD600]/8 px-3 py-1.5 font-(family-name:--font-poppins) text-[11px] uppercase tracking-[0.14em] text-[#FFD600]">
              Contact
            </div>
            <h1 className="mt-6 font-(family-name:--font-geist-sans) text-4xl font-black uppercase tracking-[-0.05em] text-[#F0F0F0] sm:text-5xl md:text-6xl">
              Contactez-nous
            </h1>
            <p className="mt-5 max-w-3xl font-(family-name:--font-poppins) text-base leading-7 text-[#B7B7B7]">
              Une question sur l&apos;API, un besoin d’intégration ou un projet à cadrer ? L’équipe msgflash
              vous répond rapidement avec le bon niveau de détail.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
            <div className="space-y-6">
              <div className="border border-white/8 bg-[#121212] p-6">
                <h2 className="mb-3 font-(family-name:--font-geist-sans) text-lg font-black uppercase tracking-[0.02em] text-[#F0F0F0]">
                  Email direct
                </h2>
                <a
                  href={`mailto:${landingBrand.helloEmail}`}
                  className="font-(family-name:--font-poppins) text-sm font-medium text-[#FFD600] transition-colors hover:text-[#FFF0A6]"
                >
                  {landingBrand.helloEmail}
                </a>
                <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#9B9B9B]">
                  Pour les demandes générales, commerciales ou partenariats.
                </p>
              </div>

              <div className="border border-white/8 bg-[#121212] p-6">
                <h2 className="mb-3 font-(family-name:--font-geist-sans) text-lg font-black uppercase tracking-[0.02em] text-[#F0F0F0]">
                  Support technique
                </h2>
                <a
                  href={`mailto:${landingBrand.supportEmail}`}
                  className="font-(family-name:--font-poppins) text-sm font-medium text-[#FFD600] transition-colors hover:text-[#FFF0A6]"
                >
                  {landingBrand.supportEmail}
                </a>
                <p className="mt-2 font-(family-name:--font-poppins) text-sm leading-6 text-[#9B9B9B]">
                  Pour les problèmes d'intégration et les incidents API.
                </p>
              </div>

              <div className="border border-white/8 bg-[#121212] p-6">
                <h2 className="mb-3 font-(family-name:--font-geist-sans) text-lg font-black uppercase tracking-[0.02em] text-[#F0F0F0]">
                  Délai de réponse
                </h2>
                <p className="font-(family-name:--font-poppins) text-sm leading-6 text-[#B8B8B8]">
                  Nous répondons à toutes les demandes dans un délai de{" "}
                  <strong className="text-[#F0F0F0]">24 heures ouvrées</strong>. Pour les incidents
                  critiques sur des plans Pro et Plus, la réponse est prioritaire.
                </p>
              </div>

              <div className="border border-white/8 bg-[#121212] p-6">
                <h2 className="mb-3 font-(family-name:--font-geist-sans) text-lg font-black uppercase tracking-[0.02em] text-[#F0F0F0]">
                  Documentation
                </h2>
                <p className="mb-4 font-(family-name:--font-poppins) text-sm leading-6 text-[#B8B8B8]">
                  Consultez notre documentation complète pour intégrer l'API en quelques minutes.
                </p>
                <Button href={landingBrand.docsUrl} variant="secondary" size="sm">
                  Voir la documentation
                </Button>
              </div>
            </div>

            <div className="border border-white/8 bg-[#111111] p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="font-(family-name:--font-geist-sans) text-2xl font-black uppercase tracking-[-0.03em] text-[#F0F0F0]">
                  Écrivez-nous
                </h2>
                <p className="mt-3 font-(family-name:--font-poppins) text-sm leading-6 text-[#9B9B9B]">
                  Décrivez votre besoin. Nous vous répondons avec les prochaines étapes, la bonne doc
                  ou le bon interlocuteur.
                </p>
              </div>

              <form className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-widest text-[#8D8D8D]">
                      Prénom &amp; Nom
                    </label>
                    <input
                      type="text"
                      placeholder="Jean Dupont"
                      required
                      className="rounded-none border border-white/10 bg-[#0D0D0D] px-4 py-3 text-sm font-(family-name:--font-poppins) text-[#F0F0F0] placeholder:text-[#6E6E6E] transition-colors focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/15"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-widest text-[#8D8D8D]">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="vous@exemple.com"
                      required
                      className="rounded-none border border-white/10 bg-[#0D0D0D] px-4 py-3 text-sm font-(family-name:--font-poppins) text-[#F0F0F0] placeholder:text-[#6E6E6E] transition-colors focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/15"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-widest text-[#8D8D8D]">
                    Sujet
                  </label>
                  <select
                    required
                    className="rounded-none border border-white/10 bg-[#0D0D0D] px-4 py-3 text-sm font-(family-name:--font-poppins) text-[#F0F0F0] transition-colors focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/15"
                  >
                    <option value="">Sélectionnez un sujet...</option>
                    <option value="integration">Aide à l'intégration</option>
                    <option value="sales">Question commerciale / Tarifs</option>
                    <option value="bug">Signaler un bug</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-(family-name:--font-geist-sans) text-xs font-semibold uppercase tracking-widest text-[#8D8D8D]">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Décrivez votre demande en détail..."
                    required
                    className="resize-none rounded-none border border-white/10 bg-[#0D0D0D] px-4 py-3 text-sm font-(family-name:--font-poppins) text-[#F0F0F0] placeholder:text-[#6E6E6E] transition-colors focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/15"
                  />
                </div>

                <button type="submit" className="w-full border border-[#FFD600] bg-[#FFD600] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] transition-colors hover:bg-[#E3C000]">
                  Envoyer le message
                </button>

                <p className="text-center font-(family-name:--font-poppins) text-xs leading-6 text-[#7F7F7F]">
                  En soumettant ce formulaire, vous acceptez notre{" "}
                  <a href="/politique-confidentialite" className="text-[#FFD600] transition-colors hover:text-[#FFF0A6]">
                    Politique de confidentialité
                  </a>.
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
