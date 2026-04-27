interface Coords {
  lat: number
  lng: number
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
const USER_AGENT = "KonzertBot/1.0 (+https://konzert.cl/bot)"

export async function geocodeAddress(
  venueName: string,
  address: string,
  city = "Santiago, Chile"
): Promise<Coords | null> {
  const queries = [
    address ? `${address}, ${city}` : null,
    `${venueName}, ${city}`,
  ].filter(Boolean) as string[]

  for (const q of queries) {
    const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=cl`

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
      })

      if (!res.ok) continue

      const results = (await res.json()) as Array<{ lat: string; lon: string }>
      if (!results[0]) continue

      return {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon),
      }
    } catch {
      continue
    }

    // Nominatim usage policy: max 1 req/sec
    await new Promise((r) => setTimeout(r, 1100))
  }

  return null
}
