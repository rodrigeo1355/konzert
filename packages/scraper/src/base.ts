import type { ScraperResult } from "./types"

export abstract class BaseScraper {
  abstract readonly platform: string

  abstract scrape(): Promise<ScraperResult>

  protected log(message: string) {
    console.log(`[${this.platform}] ${message}`)
  }
}
