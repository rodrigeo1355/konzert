import { BaseScraper } from "../base"
import type { ScrapedEvent, ScraperResult } from "../types"

export class PasslineScraper extends BaseScraper {
  readonly platform = "PASSLINE"
  protected readonly baseUrl = "https://passline.com"

  async scrape(): Promise<ScraperResult> {
    const startedAt = Date.now()
    const events: ScrapedEvent[] = []
    const errors: string[] = []

    try {
      const { load } = await import("cheerio")

      const response = await fetch(`${this.baseUrl}/cl/eventos?categoria=musica`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; KonzertBot/1.0; +https://konzert.cl/bot)",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      await this.delay()

      const $ = load(html)

      $(".event-card").each((_, el) => {
        const title = $(el).find(".event-title").text().trim()
        const dateStr = $(el).find("time").attr("datetime") ?? ""
        const venue = $(el).find(".event-venue").text().trim()
        const url = $(el).find("a").attr("href") ?? ""
        const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}${url}`

        if (!title || !url) return

        const dateStart = new Date(dateStr)
        if (isNaN(dateStart.getTime())) {
          errors.push(`Invalid date for event: ${title}`)
          return
        }

        events.push({
          title,
          dateStart,
          venueName: venue,
          venueAddress: "",
          ticketUrl: fullUrl,
          platform: this.platform,
          artistNames: [],
        })
      })

      this.log(`Scraped ${events.length} events, ${errors.length} errors`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(msg)
      this.logError("Fatal error during scrape", err)
    }

    return { platform: this.platform, events, errors, durationMs: Date.now() - startedAt }
  }
}
