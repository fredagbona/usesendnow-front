import type { Metadata } from "next"
import { ArrowRight01Icon, Calendar03Icon, Megaphone01Icon } from "hugeicons-react"
import { Navbar } from "../../components/sections/Navbar"
import { Footer } from "../../components/sections/Footer"
import { detectLandingLocaleFromHeaders } from "../../lib/landing-locale.server"
import { getLandingV2Copy } from "../../lib/landing-v2-copy"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLandingLocaleFromHeaders()
  return {
    title: locale === "fr" ? "Annonces produit | MsgFlash" : "Product announcements | MsgFlash",
    description:
      locale === "fr"
        ? "Les mises à jour produit et annonces importantes de MsgFlash."
        : "Product updates and important announcements from MsgFlash.",
  }
}

interface AnnouncementCoverProps {
  label: string
}

function AnnouncementCover({ label }: AnnouncementCoverProps) {
  return (
    <div className="relative flex aspect-[1.65] items-end overflow-hidden border-b border-black/10 bg-[#171515] p-6 sm:p-8">
      <div className="absolute -right-16 -top-20 h-64 w-64 border border-[#FFD600]/40" />
      <div className="absolute right-8 top-8 h-36 w-36 border border-[#25D366]/50" />
      <div className="absolute bottom-10 left-1/2 h-px w-[150%] -translate-x-1/2 rotate-[-18deg] bg-[#FFD600]/70" />
      <div className="relative z-10 flex items-center gap-3 text-[#FCFAF4]">
        <Megaphone01Icon className="h-7 w-7 text-[#FFD600]" aria-hidden="true" />
        <span className="max-w-[16rem] font-(family-name:--font-geist-sans) text-2xl font-bold leading-none tracking-[-0.04em] sm:text-3xl">
          {label}
        </span>
      </div>
    </div>
  )
}

export default async function AnnouncementsPage() {
  const locale = await detectLandingLocaleFromHeaders()
  const copy = getLandingV2Copy(locale)

  return (
    <>
      <Navbar />
      <main className="bg-[#FCFAF4]">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          <header className="max-w-3xl">
            <p className="font-(family-name:--font-geist-sans) text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A18A00]">
              {locale === "fr" ? "Actualités produit" : "Product news"}
            </p>
            <h1 className="mt-5 font-(family-name:--font-geist-sans) text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-[#171515]">
              {locale === "fr" ? "Les annonces MsgFlash." : "MsgFlash announcements."}
            </h1>
            <p className="mt-6 max-w-2xl font-(family-name:--font-poppins) text-lg leading-8 text-[#625B54]">
              {locale === "fr"
                ? "Les évolutions produit, les nouvelles capacités et les changements importants, au même endroit."
                : "Product evolutions, new capabilities, and important changes, all in one place."}
            </p>
          </header>

          <section className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3" aria-label={locale === "fr" ? "Liste des annonces" : "Announcement list"}>
            {copy.announcements.map((announcement) => (
              <article key={announcement.href} className="flex h-full flex-col border border-black/10 bg-white">
                <AnnouncementCover label={announcement.coverLabel} />
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="flex items-center gap-2 font-(family-name:--font-geist-sans) text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A7268]">
                    <Calendar03Icon className="h-4 w-4" aria-hidden="true" />
                    {announcement.date}
                  </p>
                  <h2 className="mt-5 font-(family-name:--font-geist-sans) text-2xl font-bold leading-tight tracking-[-0.04em] text-[#171515]">
                    <a
                      href={announcement.href}
                      className="transition-colors hover:text-[#A18A00] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                    >
                      {announcement.title}
                    </a>
                  </h2>
                  <p className="mt-4 flex-1 font-(family-name:--font-poppins) text-sm leading-7 text-[#625B54]">
                    {announcement.summary}
                  </p>
                  <a
                    href={announcement.href}
                    className="mt-8 inline-flex items-center gap-2 font-(family-name:--font-geist-sans) text-sm font-semibold text-[#171515] hover:text-[#A18A00] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                  >
                    {locale === "fr" ? "Lire l’annonce" : "Read announcement"}
                    <ArrowRight01Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
