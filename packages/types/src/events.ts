export type EventStatus = "DRAFT" | "PUBLISHED" | "REJECTED"
export type SaleStatus = "UPCOMING" | "ON_SALE" | "SOLD_OUT"

export interface EventSummary {
  id: string
  title: string
  dateStart: Date
  status: EventStatus
  saleStatus: SaleStatus
  venueId: string
}
