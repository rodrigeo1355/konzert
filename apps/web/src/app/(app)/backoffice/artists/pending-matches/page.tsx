import { PendingMatches } from "@/components/admin/pending-matches"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Matches pendientes — Backoffice Konzert" }

export default function PendingMatchesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/backoffice/artists"
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
        <h1 className="text-xl font-bold text-white">Cola de revisión de matches</h1>
        <p className="text-sm text-white/40 mt-1">
          Matches automáticos con confianza inferior al 90% que requieren confirmación.
        </p>
      </div>
      <PendingMatches />
    </div>
  )
}
