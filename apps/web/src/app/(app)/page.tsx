import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "Konzert — Descubre eventos en Santiago",
  description: "El mapa de conciertos y eventos de Santiago de Chile. Encuentra lo que viene cerca tuyo.",
}

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect("/map")

  return (
    <div className="relative min-h-screen bg-black flex flex-col overflow-hidden">
      {/* Glows de fondo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(30,58,138,0.35) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.18) 0%, transparent 50%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <Image
          src="/konzert-wordmark.svg"
          alt="Konzert"
          width={168}
          height={32}
          priority
          unoptimized
        />
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/login"
            className="text-white/50 hover:text-white transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold text-sm hover:-translate-y-px transition-transform"
          >
            Crear cuenta
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 gap-8 py-20">
        <div className="flex flex-col items-center gap-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 text-[#06b6d4] text-xs font-medium tracking-wide">
            Santiago de Chile
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-[1.05]">
            Todos los conciertos,{" "}
            <span className="gradient-text">en un solo mapa</span>
          </h1>

          <p className="text-lg text-white/50 max-w-lg leading-relaxed">
            Konzert agrega eventos de todas las plataformas de tickets y te los muestra donde ocurren. Nunca más te pierdas un show.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <Link
              href="/map"
              className="px-7 py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold text-sm hover:-translate-y-px hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all"
            >
              Ver conciertos
            </Link>
            <Link
              href="/register"
              className="px-7 py-3 rounded-full border border-white/15 text-white/70 font-semibold text-sm hover:border-white/30 hover:text-white transition-all"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mt-8">
          {[
            {
              title: "Mapa interactivo",
              desc: "Ve los eventos sobre el mapa de la ciudad, filtra por fecha y descubre nuevos lugares.",
            },
            {
              title: "Todas las plataformas",
              desc: "PuntoTicket, Joinnus, Fintix y más. Todo en un solo lugar, siempre actualizado.",
            },
            {
              title: "Sigue tus artistas",
              desc: "Recibe notificaciones cuando tus artistas favoritos anuncien shows en Santiago.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-left"
            >
              <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-white/20">
        © {new Date().getFullYear()} Konzert — Santiago de Chile
      </footer>
    </div>
  )
}
