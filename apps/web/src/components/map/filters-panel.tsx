"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useTransition } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"

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
    <div className="flex flex-col gap-4 p-4 bg-card border rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 px-2 text-xs">
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Radio */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Radio</Label>
        <div className="flex gap-1 flex-wrap">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("radius", String(opt.value))}
              className={[
                "px-2.5 py-1 rounded-full text-xs border transition-colors",
                String(opt.value) === radius
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-input hover:bg-accent",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="from" className="text-xs text-muted-foreground">
            Desde
          </Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => update("from", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="to" className="text-xs text-muted-foreground">
            Hasta
          </Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => update("to", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Precio máximo */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
          Precio máximo (CLP)
        </Label>
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
        <p className="text-xs text-muted-foreground text-center">Actualizando...</p>
      )}
    </div>
  )
}
