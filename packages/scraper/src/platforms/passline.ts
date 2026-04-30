import { BaseScraper } from "../base"
import type { ScraperResult } from "../types"

export class PasslineScraper extends BaseScraper {
  readonly platform = "PASSLINE"
  protected readonly baseUrl = "https://www.passline.com"

  async scrape(): Promise<ScraperResult> {
    const startedAt = Date.now()
    // Passline protege todos sus endpoints con Cloudflare Turnstile (challenge interactivo).
    // El scraping headless convencional está bloqueado con HTTP 403.
    // Solución pendiente: integrar playwright-extra + stealth plugin o API oficial.
    this.log("Skipped — blocked by Cloudflare Turnstile")
    return {
      platform: this.platform,
      events: [],
      errors: ["Passline blocked by Cloudflare Turnstile — requires stealth plugin or official API"],
      durationMs: Date.now() - startedAt,
    }
  }
}
