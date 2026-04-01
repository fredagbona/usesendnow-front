import type { ReactNode } from "react"
import { Shield01Icon, CodeIcon } from "hugeicons-react"
import BrandMark from "@/components/shared/BrandMark"

interface AuthLayoutProps {
  children: ReactNode
}

const FEATURES = [
  {
    icon: Shield01Icon,
    title: "Sécurité entreprise",
    description: "Chiffrement, webhooks signés et contrôles d'accès pour vos flux critiques.",
  },
  {
    icon: CodeIcon,
    title: "API pensée pour les développeurs",
    description: "Une intégration claire, rapide à brancher et stable à opérer en production.",
  },
]

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen md:flex">
      <div className="hidden md:block md:w-1/2 shrink-0">
        <div className="relative flex h-screen flex-col overflow-hidden bg-neutral-dark p-10 lg:p-14">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

          <div className="relative shrink-0">
            <BrandMark textClassName="text-xl text-primary" />
          </div>

          <div className="relative my-auto space-y-8 py-10">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                WhatsApp en production,
                <br />
                <span className="text-primary">sans friction.</span>
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
                Connectez vos numéros, automatisez vos messages et pilotez vos campagnes depuis
                une console conçue pour aller vite.
              </p>
            </div>

            <ul className="space-y-4">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/15">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/40">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen flex-1 items-center justify-center bg-bg px-6 py-12 shadow-[-20px_0_60px_rgba(0,0,0,0.12)] sm:px-10">
        {children}
      </div>
    </div>
  )
}
