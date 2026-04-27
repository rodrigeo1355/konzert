import { describe, it, expect } from "vitest"
import { matchArtists } from "./artist-match"
import type { ArtistRecord } from "./artist-match"

const artists: ArtistRecord[] = [
  { id: "a1", nameNormalized: "duki" },
  { id: "a2", nameNormalized: "bad gyal" },
  { id: "a3", nameNormalized: "nathy peluso" },
  { id: "a4", nameNormalized: "cosculluela" },
  { id: "a5", nameNormalized: "u2" },
]

describe("matchArtists", () => {
  describe("explicit artist names (score 1.0)", () => {
    it("matches an exact normalized name", () => {
      const result = matchArtists("Concierto en Santiago", ["Duki"], artists)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ artistId: "a1", matchScore: 1.0 })
    })

    it("is case-insensitive and ignores accents", () => {
      const result = matchArtists("Concierto", ["NATHY PELUSO"], artists)
      expect(result[0]?.artistId).toBe("a3")
      expect(result[0]?.matchScore).toBe(1.0)
    })

    it("matches multiple explicit artists", () => {
      const result = matchArtists("Noche de gala", ["Duki", "Bad Gyal"], artists)
      const ids = result.map((r) => r.artistId)
      expect(ids).toContain("a1")
      expect(ids).toContain("a2")
    })

    it("returns empty when no explicit name matches", () => {
      const result = matchArtists("Concierto", ["Artista Desconocido"], artists)
      expect(result).toHaveLength(0)
    })
  })

  describe("title substring match (score 0.8)", () => {
    it("finds an artist whose name appears in the event title", () => {
      const result = matchArtists("Duki en Vivo — Tour 2026", [], artists)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ artistId: "a1", matchScore: 0.8 })
    })

    it("matches multiple artists from title", () => {
      const result = matchArtists("Cosculluela & Bad Gyal en el Movistar", [], artists)
      const ids = result.map((r) => r.artistId)
      expect(ids).toContain("a4")
      expect(ids).toContain("a2")
    })

    it("ignores accents when matching title", () => {
      const result = matchArtists("Nathy Peluso — Sesiones Íntimas", [], artists)
      expect(result[0]?.artistId).toBe("a3")
    })

    it("returns empty when title has no known artist", () => {
      const result = matchArtists("Festival de Jazz 2026", [], artists)
      expect(result).toHaveLength(0)
    })
  })

  describe("short artist names (length guard)", () => {
    it("does not match artists with name shorter than 3 chars via title substring", () => {
      const result = matchArtists("Concierto de U2 en Santiago", [], artists)
      expect(result).toHaveLength(0)
    })

    it("still matches short names given as explicit artistNames", () => {
      const result = matchArtists("Concierto", ["U2"], artists)
      expect(result[0]?.artistId).toBe("a5")
    })
  })

  describe("deduplication", () => {
    it("does not duplicate an artist matched by both explicit name and title", () => {
      const result = matchArtists("Duki en vivo", ["Duki"], artists)
      const ids = result.map((r) => r.artistId)
      expect(ids.filter((id) => id === "a1")).toHaveLength(1)
    })

    it("explicit match wins over title match (score 1.0, not 0.8)", () => {
      const result = matchArtists("Duki en vivo", ["Duki"], artists)
      const match = result.find((r) => r.artistId === "a1")
      expect(match?.matchScore).toBe(1.0)
    })
  })

  describe("edge cases", () => {
    it("returns empty for empty artist list in DB", () => {
      const result = matchArtists("Duki en vivo", ["Duki"], [])
      expect(result).toHaveLength(0)
    })

    it("returns empty for empty title and no explicit names", () => {
      const result = matchArtists("", [], artists)
      expect(result).toHaveLength(0)
    })
  })
})
