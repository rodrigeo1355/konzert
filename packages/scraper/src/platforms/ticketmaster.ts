import { chromium } from "playwright"
import { BaseScraper } from "../base"
import type { ScrapedEvent, ScraperResult } from "../types"

export class TicketmasterScraper extends BaseScraper {
  readonly platform = "TICKETMASTER"
  protected readonly baseUrl = "https://www.ticketmaster.cl"

  async scrape(): Promise<ScraperResult> {
    const startedAt = Date.now()
    const events: ScrapedEvent[] = []
    const errors: string[] = []

    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (compatible; KonzertBot/1.0; +https://konzert.cl/bot)",
    })

    try {
      const page = await context.newPage()
      page.setDefaultTimeout(30_000)

      await page.goto(`${this.baseUrl}/conciertos-musica`, { waitUntil: "networkidle" })
      await this.delay()

      const cards = await page.$$eval(".event-tile", (els) =>
        els.map((el) => ({
          title: el.querySelector(".event-name")?.textContent?.trim() ?? "",
          date: el.querySelector(".event-date")?.getAttribute("datetime") ?? "",
          venue: el.querySelector(".event-venue")?.textContent?.trim() ?? "",
          url: (el.querySelector("a") as unknown as { href?: string } | null)?.href ?? "",
        }))
      )

      for (const card of cards) {
        if (!card.title || !card.url) continue
        const dateStart = new Date(card.date)
        if (isNaN(dateStart.getTime())) {
          errors.push(`Invalid date for event: ${card.title}`)
          continue
        }

        events.push({
          title: card.title,
          dateStart,
          venueName: card.venue,
          venueAddress: "",
          ticketUrl: card.url,
          platform: this.platform,
          artistNames: [],
        })

        await this.delay()
      }

      this.log(`Scraped ${events.length} events, ${errors.length} errors`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(msg)
      this.logError("Fatal error during scrape", err)
    } finally {
      await browser.close()
    }

    return { platform: this.platform, events, errors, durationMs: Date.now() - startedAt }
  }
}
