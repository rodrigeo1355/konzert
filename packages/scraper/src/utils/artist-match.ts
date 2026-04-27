export interface ArtistRecord {
  id: string
  nameNormalized: string
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

export function matchArtists(
  eventTitle: string,
  scrapedArtistNames: string[],
  artists: ArtistRecord[]
): Array<{ artistId: string; matchScore: number }> {
  const titleNorm = normalize(eventTitle)
  const matched = new Map<string, number>()

  for (const name of scrapedArtistNames) {
    const norm = normalize(name)
    for (const artist of artists) {
      if (artist.nameNormalized === norm) {
        matched.set(artist.id, 1.0)
        break
      }
    }
  }

  for (const artist of artists) {
    if (matched.has(artist.id)) continue
    if (
      artist.nameNormalized.length >= 3 &&
      titleNorm.includes(artist.nameNormalized)
    ) {
      matched.set(artist.id, 0.8)
    }
  }

  return Array.from(matched.entries()).map(([artistId, matchScore]) => ({
    artistId,
    matchScore,
  }))
}
