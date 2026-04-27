export interface MapEvent {
  id: string
  title: string
  dateStart: string
  saleStatus: "UPCOMING" | "ON_SALE" | "SOLD_OUT"
  priceMin: number | null
  priceMax: number | null
  imageUrl: string | null
  venueId: string
  venueName: string
  venueAddress: string
  lat: number | null
  lng: number | null
  distanceMeters: number
}

export interface EventDetail {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  dateStart: string
  dateEnd: string | null
  saleStatus: "UPCOMING" | "ON_SALE" | "SOLD_OUT"
  priceMin: number | null
  priceMax: number | null
  venue: { id: string; name: string; address: string }
  artists: Array<{ artist: { id: string; name: string; imageUrl: string | null }; matchScore: number }>
  platforms: Array<{ id: string; platform: string; ticketUrl: string }>
}

export interface MapFilters {
  lat: number
  lng: number
  radius: number
  from: string | null
  to: string | null
  maxPrice: number | null
}
