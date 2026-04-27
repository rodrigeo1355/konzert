"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EventStatus = "DRAFT" | "PUBLISHED" | "REJECTED"
type SaleStatus = "UPCOMING" | "ON_SALE" | "SOLD_OUT"
type Platform = "PUNTOTICKET" | "TICKETMASTER" | "PASSLINE" | "JOINNUS" | "FINTIX" | "EVENTBRITE" | "OTHER"

interface Venue {
  id: string
  name: string
}

interface EventFormData {
  id?: string
  title: string
  description: string
  imageUrl: string
  dateStart: string
  dateEnd: string
  venueId: string
  status: EventStatus
  saleStatus: SaleStatus
  priceMin: string
  priceMax: string
  ticketUrl: string
  ticketPlatform: Platform
}

interface Props {
  venues: Venue[]
  initial?: Partial<EventFormData>
}

const PLATFORMS: Platform[] = ["PUNTOTICKET", "TICKETMASTER", "PASSLINE", "JOINNUS", "FINTIX", "EVENTBRITE", "OTHER"]

export function EventForm({ venues, initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial?.id

  const [form, setForm] = useState<EventFormData>({
    id: initial?.id,
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    imageUrl: initial?.imageUrl ?? "",
    dateStart: initial?.dateStart ?? "",
    dateEnd: initial?.dateEnd ?? "",
    venueId: initial?.venueId ?? "",
    status: initial?.status ?? "DRAFT",
    saleStatus: initial?.saleStatus ?? "UPCOMING",
    priceMin: initial?.priceMin ?? "",
    priceMax: initial?.priceMax ?? "",
    ticketUrl: initial?.ticketUrl ?? "",
    ticketPlatform: initial?.ticketPlatform ?? "OTHER",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function set(field: keyof EventFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const payload = {
      title: form.title,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      dateStart: form.dateStart,
      dateEnd: form.dateEnd || undefined,
      venueId: form.venueId,
      status: form.status,
      saleStatus: form.saleStatus,
      priceMin: form.priceMin ? parseInt(form.priceMin) : undefined,
      priceMax: form.priceMax ? parseInt(form.priceMax) : undefined,
      ticketUrl: form.ticketUrl || undefined,
      ticketPlatform: form.ticketUrl ? form.ticketPlatform : undefined,
    }

    const url = isEdit ? `/api/admin/events/${form.id}` : "/api/admin/events"
    const method = isEdit ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push("/backoffice/events")
      router.refresh()
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? "Error inesperado.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6 max-w-2xl">
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="text-xs text-white/30 uppercase tracking-widest font-medium mb-2">
          Información del evento
        </legend>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            placeholder="Nombre del evento"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Descripción del evento"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#06b6d4]/50 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="imageUrl">URL de imagen</Label>
          <Input
            id="imageUrl"
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-xs text-white/30 uppercase tracking-widest font-medium mb-2">
          Fecha y lugar
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dateStart">Fecha inicio *</Label>
            <Input
              id="dateStart"
              type="datetime-local"
              value={form.dateStart}
              onChange={(e) => set("dateStart", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dateEnd">Fecha fin</Label>
            <Input
              id="dateEnd"
              type="datetime-local"
              value={form.dateEnd}
              onChange={(e) => set("dateEnd", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="venueId">Recinto *</Label>
          <select
            id="venueId"
            value={form.venueId}
            onChange={(e) => set("venueId", e.target.value)}
            required
            className="h-10 rounded-xl border border-white/10 bg-white/5 text-sm text-white px-3 focus:outline-none focus:border-[#06b6d4]/50"
          >
            <option value="">Selecciona un recinto</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-xs text-white/30 uppercase tracking-widest font-medium mb-2">
          Estado y precio
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as EventStatus)}
              className="h-10 rounded-xl border border-white/10 bg-white/5 text-sm text-white px-3 focus:outline-none focus:border-[#06b6d4]/50"
            >
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="REJECTED">Rechazado</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="saleStatus">Estado de venta</Label>
            <select
              id="saleStatus"
              value={form.saleStatus}
              onChange={(e) => set("saleStatus", e.target.value as SaleStatus)}
              className="h-10 rounded-xl border border-white/10 bg-white/5 text-sm text-white px-3 focus:outline-none focus:border-[#06b6d4]/50"
            >
              <option value="UPCOMING">Próximamente</option>
              <option value="ON_SALE">En venta</option>
              <option value="SOLD_OUT">Agotado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priceMin">Precio mínimo (CLP)</Label>
            <Input
              id="priceMin"
              type="number"
              value={form.priceMin}
              onChange={(e) => set("priceMin", e.target.value)}
              placeholder="15000"
              min={0}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priceMax">Precio máximo (CLP)</Label>
            <Input
              id="priceMax"
              type="number"
              value={form.priceMax}
              onChange={(e) => set("priceMax", e.target.value)}
              placeholder="80000"
              min={0}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-xs text-white/30 uppercase tracking-widest font-medium mb-2">
          Plataforma de tickets
        </legend>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ticketPlatform">Plataforma</Label>
          <select
            id="ticketPlatform"
            value={form.ticketPlatform}
            onChange={(e) => set("ticketPlatform", e.target.value as Platform)}
            className="h-10 rounded-xl border border-white/10 bg-white/5 text-sm text-white px-3 focus:outline-none focus:border-[#06b6d4]/50"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ticketUrl">URL de compra</Label>
          <Input
            id="ticketUrl"
            value={form.ticketUrl}
            onChange={(e) => set("ticketUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </fieldset>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear evento"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/backoffice/events")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
