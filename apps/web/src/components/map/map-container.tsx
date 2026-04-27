"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { EventMap } from "./event-map"
import { EventCard } from "./event-card"
import { FiltersPanel } from "./filters-panel"
import type { MapEvent, MapFilters } from "@/lib/types"

const SANTIAGO = { lat: -33.4489, lng: -70.6693 }

export function MapContainer() {
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<MapEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null)
  const [mapCenter, setMapCenter] = useState(SANTIAGO)
  const abortRef = useRef<AbortController | null>(null)

  const filters: MapFilters = {
    lat: mapCenter.lat,
    lng: mapCenter.lng,
    radius: parseInt(searchParams.get("radius") ?? "5000"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null,
  }

  const fetchEvents = useCallback(async (f: MapFilters) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const params = new URLSearchParams({
        lat: String(f.lat),
        lng: String(f.lng),
        radius: String(f.radius),
        ...(f.from ? { from: f.from } : {}),
        ...(f.to ? { to: f.to } : {}),
        ...(f.maxPrice != null ? { maxPrice: String(f.maxPrice) } : {}),
      })

      const res = await fetch(`/api/events?${params}`, { signal: controller.signal })
      if (!res.ok) return
      const data = await res.json() as MapEvent[]
      setEvents(data)
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch cuando cambian filtros o centro del mapa
  useEffect(() => {
    void fetchEvents(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.get("radius"),
    searchParams.get("from"),
    searchParams.get("to"),
    searchParams.get("maxPrice"),
    mapCenter.lat,
    mapCenter.lng,
  ])

  // Geolocalización inicial
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    )
  }, [])

  const handleMapMove = useCallback((lat: number, lng: number) => {
    setMapCenter({ lat, lng })
  }, [])

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Mapa */}
      <EventMap
        events={events}
        filters={filters}
        selectedEventId={selectedEvent?.id ?? null}
        onEventSelect={setSelectedEvent}
        onMapMove={handleMapMove}
      />

      {/* Filtros — esquina superior izquierda */}
      <div className="absolute top-4 left-4 z-10 w-64">
        <FiltersPanel />
      </div>

      {/* Sin resultados */}
      {!loading && events.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#111111]/95 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-5 shadow-xl text-center">
          <p className="font-semibold text-sm text-white">No hay eventos con estos filtros</p>
          <p className="text-xs text-white/40 mt-1">Intenta ampliar el radio o cambiar las fechas</p>
        </div>
      )}

      {/* Card de evento seleccionado — esquina inferior izquierda */}
      {selectedEvent && (
        <div className="absolute bottom-8 left-4 z-10">
          <EventCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-16 z-10 bg-[#111111]/90 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/40 shadow-lg">
          Cargando eventos…
        </div>
      )}
    </div>
  )
}
