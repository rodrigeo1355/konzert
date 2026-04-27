import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { ReactNode } from "react"

export default async function BackofficeLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/map")

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
          <Link href="/map" className="text-sm font-bold tracking-tight gradient-text">
            Konzert
          </Link>
          <span className="text-white/20 text-xs font-medium uppercase tracking-widest">
            Backoffice
          </span>
          <div className="flex items-center gap-5 text-sm text-white/40 ml-auto">
            <Link href="/backoffice/events" className="hover:text-white transition-colors">
              Eventos
            </Link>
            <Link href="/backoffice/scraper" className="hover:text-white transition-colors">
              Scraper
            </Link>
            <Link href="/backoffice/artists" className="hover:text-white transition-colors">
              Artistas
            </Link>
            <Link href="/backoffice/users" className="hover:text-white transition-colors">
              Usuarios
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
