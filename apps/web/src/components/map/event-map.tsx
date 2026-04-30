"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import type { MapEvent, MapFilters } from "@/lib/types"

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"

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
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [filters.lng, filters.lat],
      zoom: 12,
    })

    map.addControl(new maplibregl.NavigationControl(), "top-right")
    map.addControl(
      new maplibregl.GeolocateControl({
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

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([event.lng, event.lat])
        .addTo(map)

      markersRef.current.push(marker)
    }
  }, [events, selectedEventId, onEventSelect])

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
