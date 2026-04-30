import { chromium } from "playwright"
import { BaseScraper } from "../base"
import type { ScrapedEvent, ScraperResult } from "../types"

const MONTHS: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
}

function parseSpanishDate(str: string): Date | null {
  const first = str.split("-")[0]?.trim() ?? ""
  const match = first.match(/(\d+)\s+de\s+(\w+)\s+(\d{4})/i)
  if (!match || !match[1] || !match[2] || !match[3]) return null
  const day = parseInt(match[1])
  const monthNum = MONTHS[match[2].toLowerCase()]
  const year = parseInt(match[3])
  if (monthNum === undefined || isNaN(day) || isNaN(year)) return null
  return new Date(year, monthNum, day)
}

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
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    })

    try {
      const page = await context.newPage()
      page.setDefaultTimeout(30_000)

      await page.goto(`${this.baseUrl}/musica`, { waitUntil: "networkidle" })
      await this.delay()

      const cards = await page.$$eval("article.event-item", (els) =>
        els.map((el) => ({
          title: el.querySelector("h3")?.textContent?.trim() ?? "",
          date: el.querySelector("p.fecha")?.textContent?.trim() ?? "",
          venue: el.querySelector("p.descripcion strong")?.textContent?.trim() ?? "",
          href: el.querySelector("a")?.getAttribute("href") ?? "",
        }))
      )

      for (const card of cards) {
        if (!card.title || !card.href) continue

        const dateStart = parseSpanishDate(card.date)
        if (!dateStart) {
          errors.push(`Invalid date for "${card.title}": ${card.date}`)
          continue
        }

        const ticketUrl = card.href.startsWith("http")
          ? card.href
          : `${this.baseUrl}${card.href.startsWith("/") ? card.href : `/${card.href}`}`

        events.push({
          title: card.title,
          dateStart,
          venueName: card.venue || "Santiago",
          venueAddress: "",
          ticketUrl,
          platform: this.platform,
          artistNames: [],
        })
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
