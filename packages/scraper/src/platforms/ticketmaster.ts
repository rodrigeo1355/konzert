import { chromium } from "playwright"
import { BaseScraper } from "../base"
import type { ScrapedEvent, ScraperResult } from "../types"

const MONTHS: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
}

function parseSpanishDate(str: string): Date | null {
  const match = str.trim().match(/(\d+)\s+de\s+(\w+)\s+(\d{4})/i)
  if (!match || !match[1] || !match[2] || !match[3]) return null
  const day = parseInt(match[1])
  const monthNum = MONTHS[match[2].toLowerCase()]
  const year = parseInt(match[3])
  if (monthNum === undefined || isNaN(day) || isNaN(year)) return null
  return new Date(year, monthNum, day)
}

function resolveUrl(href: string, pageUrl: string): string {
  if (href.startsWith("http")) return href
  try {
    return new URL(href, pageUrl).href
  } catch {
    return href
  }
}

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
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    })

    try {
      const page = await context.newPage()
      page.setDefaultTimeout(30_000)

      const listUrl = `${this.baseUrl}/page/musica`
      await page.goto(listUrl, { waitUntil: "networkidle" })
      await this.delay()

      const cards = await page.$$eval(".grid_element", (els) =>
        els.map((el) => ({
          title: el.querySelector(".item_title")?.textContent?.trim() ?? "",
          date: el.querySelector(".details p")?.textContent?.trim() ?? "",
          venue: el.querySelector(".grid-label")?.textContent?.trim() ?? "",
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

        events.push({
          title: card.title,
          dateStart,
          venueName: card.venue || "Santiago",
          venueAddress: "",
          ticketUrl: resolveUrl(card.href, listUrl),
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
