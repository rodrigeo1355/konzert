import { Suspense } from "react"
import { MapContainer } from "@/components/map/map-container"

export const metadata = { title: "Mapa de eventos — Konzert" }

export default function MapPage() {
  return (
    <Suspense>
      <MapContainer />
    </Suspense>
  )
}
