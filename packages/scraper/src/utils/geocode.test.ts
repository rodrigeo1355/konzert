import { describe, it, expect, vi, beforeEach } from "vitest"
import { geocodeAddress } from "./geocode"

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

function nominatimResponse(lat: string, lon: string) {
  return {
    ok: true,
    json: async () => [{ lat, lon }],
  }
}

function emptyResponse() {
  return {
    ok: true,
    json: async () => [],
  }
}

function errorResponse() {
  return { ok: false }
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe("geocodeAddress", () => {
  it("returns coords from the first successful query (address)", async () => {
    mockFetch.mockResolvedValueOnce(nominatimResponse("-33.4557", "-70.6782"))

    const result = await geocodeAddress("Movistar Arena", "Av. Beauchef 1300, Santiago")

    expect(result).toEqual({ lat: -33.4557, lng: -70.6782 })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it("falls back to venue name query when address returns empty", async () => {
    mockFetch
      .mockResolvedValueOnce(emptyResponse())
      .mockResolvedValueOnce(nominatimResponse("-33.4560", "-70.6500"))

    const result = await geocodeAddress("Teatro Caupolicán", "San Diego 850")

    expect(result).toEqual({ lat: -33.456, lng: -70.65 })
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it("returns null when all queries fail (non-ok response)", async () => {
    mockFetch.mockResolvedValue(errorResponse())

    const result = await geocodeAddress("Venue Inexistente", "Dirección Falsa")

    expect(result).toBeNull()
  })

  it("returns null when all queries return empty results", async () => {
    mockFetch.mockResolvedValue(emptyResponse())

    const result = await geocodeAddress("Venue Inexistente", "Dirección Falsa")

    expect(result).toBeNull()
  })

  it("skips empty address and goes directly to venue name query", async () => {
    mockFetch.mockResolvedValueOnce(nominatimResponse("-33.4682", "-70.6789"))

    const result = await geocodeAddress("Anfiteatro Parque O'Higgins", "")

    expect(result).toEqual({ lat: -33.4682, lng: -70.6789 })
    const url = mockFetch.mock.calls[0]?.[0] as string
    expect(url).toContain("Anfiteatro")
  })

  it("includes countrycodes=cl in the request", async () => {
    mockFetch.mockResolvedValueOnce(nominatimResponse("-33.4", "-70.6"))

    await geocodeAddress("Venue", "Dirección 123")

    const url = mockFetch.mock.calls[0]?.[0] as string
    expect(url).toContain("countrycodes=cl")
  })

  it("sends the KonzertBot User-Agent header", async () => {
    mockFetch.mockResolvedValueOnce(nominatimResponse("-33.4", "-70.6"))

    await geocodeAddress("Venue", "Dirección 123")

    const options = mockFetch.mock.calls[0]?.[1] as RequestInit
    expect((options.headers as Record<string, string>)["User-Agent"]).toContain("KonzertBot")
  })

  it("continues to fallback query when fetch throws", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(nominatimResponse("-33.5", "-70.5"))

    const result = await geocodeAddress("Venue", "Dirección 123")

    expect(result).toEqual({ lat: -33.5, lng: -70.5 })
  })
})
