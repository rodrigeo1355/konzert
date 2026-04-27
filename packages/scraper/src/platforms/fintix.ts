import { BaseScraper } from "../base"
import type { ScrapedEvent, ScraperResult } from "../types"

export class FintixScraper extends BaseScraper {
  readonly platform = "FINTIX"
  protected readonly baseUrl = "https://fintix.cl"

  async scrape(): Promise<ScraperResult> {
    const startedAt = Date.now()
    const events: ScrapedEvent[] = []
    const errors: string[] = []

    try {
      const { load } = await import("cheerio")

      const response = await fetch(`${this.baseUrl}/eventos?categoria=musica`, {
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

      $(".event-item, .card-evento, article[data-event]").each((_, el) => {
        const title =
          $(el).find(".event-name, .titulo-evento, h2, h3").first().text().trim()
        const dateStr =
          $(el).find("time").attr("datetime") ??
          $(el).find("[data-fecha]").attr("data-fecha") ??
          ""
        const venue =
          $(el).find(".event-venue, .recinto, [data-recinto]").first().text().trim()
        const address =
          $(el).find(".event-address, .direccion, [data-direccion]").first().text().trim()
        const href =
          $(el).find("a").first().attr("href") ?? ""
        const fullUrl = href.startsWith("http") ? href : `${this.baseUrl}${href}`
        const priceText =
          $(el).find(".precio, .event-price, [data-precio]").first().text().trim()
        const imageUrl =
          $(el).find("img").first().attr("src") ?? ""

        if (!title || !href) return

        const dateStart = new Date(dateStr)
        if (isNaN(dateStart.getTime())) {
          errors.push(`Invalid date for event: ${title}`)
          return
        }

        const priceMin = this.parsePrice(priceText)

        events.push({
          title,
          dateStart,
          venueName: venue,
          venueAddress: address,
          ticketUrl: fullUrl,
          platform: this.platform,
          artistNames: [],
          imageUrl: imageUrl || undefined,
          priceMin: priceMin ?? undefined,
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

  private parsePrice(text: string): number | null {
    const match = text.replace(/\./g, "").match(/\d+/)
    return match ? parseInt(match[0], 10) : null
  }
}
