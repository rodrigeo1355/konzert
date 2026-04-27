import type { ScraperResult } from "./types"

export abstract class BaseScraper {
  abstract readonly platform: string
  protected abstract readonly baseUrl: string

  abstract scrape(): Promise<ScraperResult>

  protected async delay(ms = 3000): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  protected normalizeText(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim()
  }

  protected log(message: string): void {
    console.log(`[${this.platform}] ${message}`)
  }

  protected logError(message: string, err?: unknown): void {
    console.error(`[${this.platform}] ${message}`, err instanceof Error ? err.message : err)
  }
}
