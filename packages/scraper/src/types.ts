export interface ScrapedEvent {
  title: string
  dateStart: Date
  dateEnd?: Date
  venueName: string
  venueAddress: string
  ticketUrl: string
  platform: string
  artistNames: string[]
  imageUrl?: string
  priceMin?: number
  priceMax?: number
}

export interface ScraperResult {
  platform: string
  events: ScrapedEvent[]
  errors: string[]
  durationMs: number
}

export type PlatformKey = "PUNTOTICKET" | "TICKETMASTER" | "PASSLINE" | "JOINNUS" | "FINTIX"
