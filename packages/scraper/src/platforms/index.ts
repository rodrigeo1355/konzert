import { PuntoTicketScraper } from "./puntoticket"
import { TicketmasterScraper } from "./ticketmaster"
import { PasslineScraper } from "./passline"
import type { BaseScraper } from "../base"
import type { PlatformKey } from "../types"

export const scrapers: Record<PlatformKey, BaseScraper> = {
  PUNTOTICKET: new PuntoTicketScraper(),
  TICKETMASTER: new TicketmasterScraper(),
  PASSLINE: new PasslineScraper(),
  JOINNUS: new PasslineScraper(), // placeholder — implementar en Sprint 1
  FINTIX: new PasslineScraper(),  // placeholder — implementar en Sprint 1
}
