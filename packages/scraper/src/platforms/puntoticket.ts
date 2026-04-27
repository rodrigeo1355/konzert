import { chromium } from "playwright"
import { BaseScraper } from "../base"
import type { ScrapedEvent, ScraperResult } from "../types"

export class PuntoTicketScraper extends BaseScraper {
  readonly platform = "PUNTOTICKET"
  protected readonly baseUrl = "https://www.puntoticket.com"

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

      await page.goto(`${this.baseUrl}/conciertos`, { waitUntil: "networkidle" })
      await this.delay()

      const cards = await page.$$eval("[data-event-card]", (els) =>
        els.map((el) => ({
          title: el.querySelector("[data-title]")?.textContent?.trim() ?? "",
          date: el.querySelector("[data-date]")?.textContent?.trim() ?? "",
          venue: el.querySelector("[data-venue]")?.textContent?.trim() ?? "",
          url: (el as unknown as { href: string }).href ?? "",
          price: el.querySelector("[data-price]")?.textContent?.trim() ?? "",
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
