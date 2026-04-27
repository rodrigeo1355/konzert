import { ScraperDashboard } from "@/components/admin/scraper-dashboard"

export const metadata = { title: "Scraper — Backoffice Konzert" }

export default function BackofficeScraperPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Monitoreo del scraper</h1>
        <p className="text-sm text-white/40 mt-1">
          Estado de cada plataforma, historial de ejecuciones y disparador manual.
        </p>
      </div>
      <ScraperDashboard />
    </div>
  )
}
