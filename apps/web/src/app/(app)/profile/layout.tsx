import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { ReactNode } from "react"

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/profile/artists")

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-6 h-14">
          <Link href="/map">
            <Image
              src="/konzert-wordmark.svg"
              alt="Konzert"
              width={90}
              height={24}
              priority
            />
          </Link>
          <div className="flex items-center gap-5 text-sm text-white/40 ml-auto">
            <Link
              href="/profile/artists"
              className="hover:text-white transition-colors"
            >
              Artistas
            </Link>
            <Link
              href="/profile/notifications"
              className="hover:text-white transition-colors"
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
