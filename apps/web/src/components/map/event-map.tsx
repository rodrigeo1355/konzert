"use client"

import { useEffect, useRef, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { MapEvent, MapFilters } from "@/lib/types"

const SANTIAGO = { lat: -33.4489, lng: -70.6693 }

interface EventMapProps {
  events: MapEvent[]
  filters: MapFilters
  selectedEventId: string | null
  onEventSelect: (event: MapEvent) => void
  onMapMove: (lat: number, lng: number) => void
}

export function EventMap({
  events,
  filters,
  selectedEventId,
  onEventSelect,
  onMapMove,
}: EventMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [filters.lng, filters.lat],
      zoom: 12,
    })

    map.addControl(new mapboxgl.NavigationControl(), "top-right")
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right"
    )

    map.on("moveend", () => {
      const center = map.getCenter()
      onMapMove(center.lat, center.lng)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Actualiza marcadores cuando cambian los eventos
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    for (const event of events) {
      if (event.lat == null || event.lng == null) continue

      const isSelected = event.id === selectedEventId

      const el = document.createElement("div")
      el.className = [
        "w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform",
        "bg-white shadow-md text-xs font-bold",
        isSelected ? "border-black scale-125 z-10" : "border-white/60 hover:scale-110",
      ].join(" ")
      el.innerHTML = "🎵"
      el.title = event.title

      el.addEventListener("click", () => onEventSelect(event))

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([event.lng, event.lat])
        .addTo(map)

      markersRef.current.push(marker)
    }
  }, [events, selectedEventId, onEventSelect])

  // Centra el mapa en el evento seleccionado
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedEventId) return

    const event = events.find((e) => e.id === selectedEventId)
    if (event?.lat != null && event?.lng != null) {
      map.easeTo({ center: [event.lng, event.lat], zoom: 14, duration: 500 })
    }
  }, [selectedEventId, events])

  return <div ref={containerRef} className="w-full h-full" />
}
