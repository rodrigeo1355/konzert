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
}

export interface ScraperResult {
  platform: string
  events: ScrapedEvent[]
  errors: string[]
  durationMs: number
}
