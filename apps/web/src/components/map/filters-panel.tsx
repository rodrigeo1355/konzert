"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useTransition } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SlidersHorizontal, X } from "lucide-react"
import { DatePicker } from "./date-picker"

const RADIUS_OPTIONS = [
  { label: "1 km", value: 1000 },
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "25 km", value: 25000 },
]

export function FiltersPanel() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""
  const maxPrice = searchParams.get("maxPrice") ?? ""
  const radius = searchParams.get("radius") ?? "5000"

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [router, pathname, searchParams]
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("from")
    params.delete("to")
    params.delete("maxPrice")
    params.delete("radius")
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [router, pathname, searchParams])

  const hasActiveFilters = from || to || maxPrice || radius !== "5000"

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#111111]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
          <SlidersHorizontal className="h-4 w-4 text-[#06b6d4]" />
          Filtros
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-[#06b6d4] transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Radio */}
      <div className="flex flex-col gap-2">
        <Label>Radio</Label>
        <div className="flex gap-1.5 flex-wrap">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("radius", String(opt.value))}
              className={[
                "px-2.5 py-1 rounded-full text-xs border transition-all",
                String(opt.value) === radius
                  ? "bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/50"
                  : "bg-white/5 text-white/50 border-white/10 hover:border-white/25 hover:text-white/80",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <DatePicker
          label="Desde"
          value={from}
          onChange={(iso) => update("from", iso)}
        />
        <DatePicker
          label="Hasta"
          value={to}
          onChange={(iso) => update("to", iso)}
          minDate={from ? new Date(from + "T00:00:00") : undefined}
        />
      </div>

      {/* Precio máximo */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="maxPrice">Precio máximo (CLP)</Label>
        <Input
          id="maxPrice"
          type="number"
          min={0}
          step={1000}
          placeholder="Sin límite"
          value={maxPrice}
          onChange={(e) => update("maxPrice", e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      {isPending && (
        <p className="text-xs text-white/30 text-center">Actualizando…</p>
      )}
    </div>
  )
}
