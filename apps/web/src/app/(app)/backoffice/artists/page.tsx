import { ArtistsCatalog } from "@/components/admin/artists-catalog"

export const metadata = { title: "Artistas — Backoffice Konzert" }

export default function BackofficeArtistsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Catálogo de artistas</h1>
        <p className="text-sm text-white/40 mt-1">
          Importa artistas desde Spotify y gestiona el matching con eventos.
        </p>
      </div>
      <ArtistsCatalog />
    </div>
  )
}
