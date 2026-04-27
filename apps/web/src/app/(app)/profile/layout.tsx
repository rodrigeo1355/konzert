import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { ReactNode } from "react"

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/profile/artists")

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-6 h-14">
          <Link href="/map" className="text-sm font-semibold tracking-tight">
            Konzert
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
            <Link
              href="/profile/artists"
              className="hover:text-foreground transition-colors"
            >
              Artistas
            </Link>
            <Link
              href="/profile/notifications"
              className="hover:text-foreground transition-colors"
            >
              Notificaciones
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
