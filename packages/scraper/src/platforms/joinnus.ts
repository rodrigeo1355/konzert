import { chromium } from "playwright"
import { BaseScraper } from "../base"
import type { ScrapedEvent, ScraperResult } from "../types"

export class JoinnusScraper extends BaseScraper {
  readonly platform = "JOINNUS"
  protected readonly baseUrl = "https://www.joinnus.com"

  async scrape(): Promise<ScraperResult> {
    const startedAt = Date.now()
    const events: ScrapedEvent[] = []
    const errors: string[] = []

    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (compatible; KonzertBot/1.0; +https://konzert.cl/bot)",
    })

    try {
      const page = await context.newPage()
      page.setDefaultTimeout(30_000)

      await page.goto(`${this.baseUrl}/CL/musica`, { waitUntil: "networkidle" })
      await this.delay()

      const cards = await page.$$eval("[data-testid='event-card']", (els) =>
        els.map((el) => ({
          title: el.querySelector("[data-testid='event-title']")?.textContent?.trim() ?? "",
          date: el.querySelector("time")?.getAttribute("datetime") ?? "",
          venue: el.querySelector("[data-testid='event-venue']")?.textContent?.trim() ?? "",
          address: el.querySelector("[data-testid='event-address']")?.textContent?.trim() ?? "",
          url: (el.querySelector("a") as unknown as { href: string } | null)?.href ?? "",
          priceText: el.querySelector("[data-testid='event-price']")?.textContent?.trim() ?? "",
          imageUrl: (el.querySelector("img") as unknown as { src: string } | null)?.src ?? "",
        }))
      )

      for (const card of cards) {
        if (!card.title || !card.url) continue

        const dateStart = new Date(card.date)
        if (isNaN(dateStart.getTime())) {
          errors.push(`Invalid date for event: ${card.title}`)
          continue
        }

        const priceMin = this.parsePrice(card.priceText)

        events.push({
          title: card.title,
          dateStart,
          venueName: card.venue,
          venueAddress: card.address,
          ticketUrl: card.url,
          platform: this.platform,
          artistNames: [],
          imageUrl: card.imageUrl || undefined,
          priceMin: priceMin ?? undefined,
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

  private parsePrice(text: string): number | null {
    const match = text.replace(/\./g, "").match(/\d+/)
    return match ? parseInt(match[0], 10) : null
  }
}
