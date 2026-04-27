import { ArtistsManager } from "@/components/profile/artists-manager"

export const metadata = { title: "Mis artistas — Konzert" }

export default function ProfileArtistsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Artistas que sigues</h1>
        <p className="text-sm text-white/40 mt-1">
          Recibirás un email cuando anuncien shows en Chile. Máximo 50.
        </p>
      </div>
      <ArtistsManager />
    </div>
  )
}
