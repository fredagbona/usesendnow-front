import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-6 py-16">
      <main className="w-full max-w-4xl rounded-[28px] border border-black/10 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(10,10,10,0.08)] md:p-12">
        <div className="flex items-center gap-3">
          <Image
            src="/favicon-96x96.png"
            alt="msgflash icon"
            width={28}
            height={28}
            priority
            className="rounded-sm"
          />
          <span className="font-(family-name:--font-geist-sans) text-lg font-bold lowercase tracking-tight text-[#0A0A0A]">
            msgflash
          </span>
          <span className="rounded-full border border-[#0A0A0A]/12 bg-[#FFD600]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B5200]">
            Admin
          </span>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B5200]">
              Console interne
            </p>
            <h1 className="mt-3 max-w-2xl font-(family-name:--font-geist-sans) text-4xl font-bold uppercase leading-none tracking-tight text-[#0A0A0A] md:text-5xl">
              Administration centralisée de l’écosystème msgflash
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-black/65">
              Cet espace regroupe les outils internes d’exploitation, de support et de contrôle produit.
              Il utilise désormais le même pack d’assets, les mêmes favicons et la même identité de partage que les autres apps du monorepo.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">Branding</p>
              <p className="mt-2 text-sm text-black/70">
                Favicon, manifest, preview social et icône de marque synchronisés avec le portal.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">Usage</p>
              <p className="mt-2 text-sm text-black/70">
                Base admin minimale et propre, sans placeholders Next.js ou Vercel.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
