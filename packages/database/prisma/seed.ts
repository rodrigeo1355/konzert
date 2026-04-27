import { PrismaClient, EventStatus, SaleStatus, Platform, ScraperStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Venues en Santiago
  const venues = await Promise.all([
    prisma.venue.upsert({
      where: { id: "venue-movistar" },
      update: {},
      create: {
        id: "venue-movistar",
        name: "Movistar Arena",
        address: "Av. Beauchef 1300, Santiago",
        city: "Santiago",
      },
    }),
    prisma.venue.upsert({
      where: { id: "venue-caupolican" },
      update: {},
      create: {
        id: "venue-caupolican",
        name: "Teatro Caupolicán",
        address: "San Diego 850, Santiago",
        city: "Santiago",
      },
    }),
    prisma.venue.upsert({
      where: { id: "venue-bnacional" },
      update: {},
      create: {
        id: "venue-bnacional",
        name: "Estadio Bicentenario de La Florida",
        address: "Av. Américo Vespucio 8065, La Florida",
        city: "Santiago",
      },
    }),
    prisma.venue.upsert({
      where: { id: "venue-blondel" },
      update: {},
      create: {
        id: "venue-blondel",
        name: "Club Blondie",
        address: "Av. Vicuña Mackenna 40, Santiago",
        city: "Santiago",
      },
    }),
    prisma.venue.upsert({
      where: { id: "venue-anfiteatro" },
      update: {},
      create: {
        id: "venue-anfiteatro",
        name: "Anfiteatro del Parque O'Higgins",
        address: "Av. Beauchef 50, Santiago",
        city: "Santiago",
      },
    }),
  ])

  // Artistas
  const artists = await Promise.all([
    prisma.artist.upsert({
      where: { id: "artist-badgyal" },
      update: {},
      create: {
        id: "artist-badgyal",
        name: "Bad Gyal",
        nameNormalized: "bad gyal",
        imageUrl: null,
        spotifyId: "6bmlMHgSheBauioMgKv2tn",
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-cosculluela" },
      update: {},
      create: {
        id: "artist-cosculluela",
        name: "Cosculluela",
        nameNormalized: "cosculluela",
        imageUrl: null,
        spotifyId: null,
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-javierzmora" },
      update: {},
      create: {
        id: "artist-javierzmora",
        name: "Javier Zmora",
        nameNormalized: "javier zmora",
        imageUrl: null,
        spotifyId: null,
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-zoekravitz" },
      update: {},
      create: {
        id: "artist-zoekravitz",
        name: "Zoe Kravitz",
        nameNormalized: "zoe kravitz",
        imageUrl: null,
        spotifyId: null,
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-duki" },
      update: {},
      create: {
        id: "artist-duki",
        name: "Duki",
        nameNormalized: "duki",
        imageUrl: null,
        spotifyId: "71kI8PJrX4YP4608bApQxE",
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-pablomiles" },
      update: {},
      create: {
        id: "artist-pablomiles",
        name: "Pablo Miles",
        nameNormalized: "pablo miles",
        imageUrl: null,
        spotifyId: null,
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-arcangel" },
      update: {},
      create: {
        id: "artist-arcangel",
        name: "Arcángel",
        nameNormalized: "arcangel",
        imageUrl: null,
        spotifyId: null,
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-flomida" },
      update: {},
      create: {
        id: "artist-flomida",
        name: "Flo Mida",
        nameNormalized: "flo mida",
        imageUrl: null,
        spotifyId: null,
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-tomMorello" },
      update: {},
      create: {
        id: "artist-tomMorello",
        name: "Tom Morello",
        nameNormalized: "tom morello",
        imageUrl: null,
        spotifyId: null,
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-nathy" },
      update: {},
      create: {
        id: "artist-nathy",
        name: "Nathy Peluso",
        nameNormalized: "nathy peluso",
        imageUrl: null,
        spotifyId: "2Tz1DTzVJ5Gyh8ZwVr48NK",
      },
    }),
  ])

  // Eventos
  const now = new Date()
  const events = await Promise.all([
    prisma.event.upsert({
      where: { id: "event-1" },
      update: {},
      create: {
        id: "event-1",
        title: "Bad Gyal en Santiago",
        dateStart: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        venueId: "venue-movistar",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.ON_SALE,
        priceMin: 35000,
        priceMax: 95000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-2" },
      update: {},
      create: {
        id: "event-2",
        title: "Duki — Antes de que Amanezca Tour",
        dateStart: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        venueId: "venue-bnacional",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.ON_SALE,
        priceMin: 28000,
        priceMax: 120000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-3" },
      update: {},
      create: {
        id: "event-3",
        title: "Nathy Peluso — Bzrp Session Tour",
        dateStart: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        venueId: "venue-movistar",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.UPCOMING,
        priceMin: 40000,
        priceMax: 110000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-4" },
      update: {},
      create: {
        id: "event-4",
        title: "Cosculluela en vivo",
        dateStart: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        venueId: "venue-caupolican",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.ON_SALE,
        priceMin: 20000,
        priceMax: 60000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-5" },
      update: {},
      create: {
        id: "event-5",
        title: "Tom Morello — Solo Tour",
        dateStart: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        venueId: "venue-blondel",
        status: EventStatus.DRAFT,
        saleStatus: SaleStatus.UPCOMING,
        priceMin: 25000,
        priceMax: 50000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-6" },
      update: {},
      create: {
        id: "event-6",
        title: "Arcángel — La Maravilla",
        dateStart: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        venueId: "venue-anfiteatro",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.UPCOMING,
        priceMin: 30000,
        priceMax: 80000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-7" },
      update: {},
      create: {
        id: "event-7",
        title: "Noche de Reggaetón — Arcángel & Cosculluela",
        dateStart: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        venueId: "venue-bnacional",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.UPCOMING,
        priceMin: 35000,
        priceMax: 90000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-8" },
      update: {},
      create: {
        id: "event-8",
        title: "Javier Zmora — Acoustic Night",
        dateStart: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        venueId: "venue-blondel",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.SOLD_OUT,
        priceMin: 15000,
        priceMax: 30000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-9" },
      update: {},
      create: {
        id: "event-9",
        title: "Pablo Miles en vivo",
        dateStart: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        venueId: "venue-caupolican",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.ON_SALE,
        priceMin: 18000,
        priceMax: 45000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-10" },
      update: {},
      create: {
        id: "event-10",
        title: "Festival Parque O'Higgins",
        dateStart: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        venueId: "venue-anfiteatro",
        status: EventStatus.DRAFT,
        saleStatus: SaleStatus.UPCOMING,
        priceMin: 20000,
        priceMax: 70000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-11" },
      update: {},
      create: {
        id: "event-11",
        title: "Duki & Bad Gyal — Collab Night",
        dateStart: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
        venueId: "venue-movistar",
        status: EventStatus.DRAFT,
        saleStatus: SaleStatus.UPCOMING,
        priceMin: 50000,
        priceMax: 150000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-12" },
      update: {},
      create: {
        id: "event-12",
        title: "Nathy Peluso — Club Edition",
        dateStart: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        venueId: "venue-blondel",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.SOLD_OUT,
        priceMin: 22000,
        priceMax: 55000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-13" },
      update: {},
      create: {
        id: "event-13",
        title: "Arcángel — La Fórmula Tour",
        dateStart: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000),
        venueId: "venue-caupolican",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.UPCOMING,
        priceMin: 25000,
        priceMax: 65000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-14" },
      update: {},
      create: {
        id: "event-14",
        title: "Flo Mida en Santiago",
        dateStart: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
        venueId: "venue-bnacional",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.ON_SALE,
        priceMin: 30000,
        priceMax: 85000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-15" },
      update: {},
      create: {
        id: "event-15",
        title: "Tom Morello & Friends",
        dateStart: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
        venueId: "venue-anfiteatro",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.ON_SALE,
        priceMin: 28000,
        priceMax: 75000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-16" },
      update: {},
      create: {
        id: "event-16",
        title: "Cosculluela — Conteo Regresivo",
        dateStart: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        venueId: "venue-movistar",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.ON_SALE,
        priceMin: 32000,
        priceMax: 95000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-17" },
      update: {},
      create: {
        id: "event-17",
        title: "Javier Zmora — Tour Unplugged",
        dateStart: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        venueId: "venue-caupolican",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.ON_SALE,
        priceMin: 18000,
        priceMax: 45000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-18" },
      update: {},
      create: {
        id: "event-18",
        title: "Bad Gyal — Noche Secreta",
        dateStart: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000),
        venueId: "venue-blondel",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.UPCOMING,
        priceMin: 15000,
        priceMax: 35000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-19" },
      update: {},
      create: {
        id: "event-19",
        title: "Duki — Pre-venta Exclusiva",
        dateStart: new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000),
        venueId: "venue-anfiteatro",
        status: EventStatus.DRAFT,
        saleStatus: SaleStatus.UPCOMING,
        priceMin: 40000,
        priceMax: 100000,
      },
    }),
    prisma.event.upsert({
      where: { id: "event-20" },
      update: {},
      create: {
        id: "event-20",
        title: "Nathy Peluso — Sesiones Íntimas",
        dateStart: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        venueId: "venue-caupolican",
        status: EventStatus.PUBLISHED,
        saleStatus: SaleStatus.ON_SALE,
        priceMin: 35000,
        priceMax: 85000,
      },
    }),
  ])

  // EventArtist links
  await Promise.all([
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-1", artistId: "artist-badgyal" } },
      update: {},
      create: { eventId: "event-1", artistId: "artist-badgyal", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-2", artistId: "artist-duki" } },
      update: {},
      create: { eventId: "event-2", artistId: "artist-duki", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-3", artistId: "artist-nathy" } },
      update: {},
      create: { eventId: "event-3", artistId: "artist-nathy", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-4", artistId: "artist-cosculluela" } },
      update: {},
      create: { eventId: "event-4", artistId: "artist-cosculluela", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-5", artistId: "artist-tomMorello" } },
      update: {},
      create: { eventId: "event-5", artistId: "artist-tomMorello", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-6", artistId: "artist-arcangel" } },
      update: {},
      create: { eventId: "event-6", artistId: "artist-arcangel", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-7", artistId: "artist-arcangel" } },
      update: {},
      create: { eventId: "event-7", artistId: "artist-arcangel", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-7", artistId: "artist-cosculluela" } },
      update: {},
      create: { eventId: "event-7", artistId: "artist-cosculluela", matchScore: 0.9 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-8", artistId: "artist-javierzmora" } },
      update: {},
      create: { eventId: "event-8", artistId: "artist-javierzmora", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-9", artistId: "artist-pablomiles" } },
      update: {},
      create: { eventId: "event-9", artistId: "artist-pablomiles", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-11", artistId: "artist-duki" } },
      update: {},
      create: { eventId: "event-11", artistId: "artist-duki", matchScore: 0.95 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-11", artistId: "artist-badgyal" } },
      update: {},
      create: { eventId: "event-11", artistId: "artist-badgyal", matchScore: 0.95 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-12", artistId: "artist-nathy" } },
      update: {},
      create: { eventId: "event-12", artistId: "artist-nathy", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-14", artistId: "artist-flomida" } },
      update: {},
      create: { eventId: "event-14", artistId: "artist-flomida", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-15", artistId: "artist-tomMorello" } },
      update: {},
      create: { eventId: "event-15", artistId: "artist-tomMorello", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-16", artistId: "artist-cosculluela" } },
      update: {},
      create: { eventId: "event-16", artistId: "artist-cosculluela", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-17", artistId: "artist-javierzmora" } },
      update: {},
      create: { eventId: "event-17", artistId: "artist-javierzmora", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-18", artistId: "artist-badgyal" } },
      update: {},
      create: { eventId: "event-18", artistId: "artist-badgyal", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-19", artistId: "artist-duki" } },
      update: {},
      create: { eventId: "event-19", artistId: "artist-duki", matchScore: 1.0 },
    }),
    prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: "event-20", artistId: "artist-nathy" } },
      update: {},
      create: { eventId: "event-20", artistId: "artist-nathy", matchScore: 1.0 },
    }),
  ])

  // EventPlatform links
  await Promise.all([
    prisma.eventPlatform.upsert({
      where: { eventId_platform: { eventId: "event-1", platform: Platform.PUNTOTICKET } },
      update: {},
      create: {
        eventId: "event-1",
        platform: Platform.PUNTOTICKET,
        ticketUrl: "https://www.puntoticket.com/bad-gyal-santiago",
      },
    }),
    prisma.eventPlatform.upsert({
      where: { eventId_platform: { eventId: "event-2", platform: Platform.TICKETMASTER } },
      update: {},
      create: {
        eventId: "event-2",
        platform: Platform.TICKETMASTER,
        ticketUrl: "https://www.ticketmaster.cl/duki-santiago",
      },
    }),
    prisma.eventPlatform.upsert({
      where: { eventId_platform: { eventId: "event-3", platform: Platform.PASSLINE } },
      update: {},
      create: {
        eventId: "event-3",
        platform: Platform.PASSLINE,
        ticketUrl: "https://passline.com/nathy-peluso-santiago",
      },
    }),
    prisma.eventPlatform.upsert({
      where: { eventId_platform: { eventId: "event-4", platform: Platform.PUNTOTICKET } },
      update: {},
      create: {
        eventId: "event-4",
        platform: Platform.PUNTOTICKET,
        ticketUrl: "https://www.puntoticket.com/cosculluela-santiago",
      },
    }),
    prisma.eventPlatform.upsert({
      where: { eventId_platform: { eventId: "event-9", platform: Platform.EVENTBRITE } },
      update: {},
      create: {
        eventId: "event-9",
        platform: Platform.EVENTBRITE,
        ticketUrl: "https://www.eventbrite.cl/pablo-miles-santiago",
      },
    }),
    prisma.eventPlatform.upsert({
      where: { eventId_platform: { eventId: "event-14", platform: Platform.PUNTOTICKET } },
      update: {},
      create: {
        eventId: "event-14",
        platform: Platform.PUNTOTICKET,
        ticketUrl: "https://www.puntoticket.com/flo-mida-santiago",
      },
    }),
    prisma.eventPlatform.upsert({
      where: { eventId_platform: { eventId: "event-16", platform: Platform.TICKETMASTER } },
      update: {},
      create: {
        eventId: "event-16",
        platform: Platform.TICKETMASTER,
        ticketUrl: "https://www.ticketmaster.cl/cosculluela-movistar",
      },
    }),
    prisma.eventPlatform.upsert({
      where: { eventId_platform: { eventId: "event-20", platform: Platform.PASSLINE } },
      update: {},
      create: {
        eventId: "event-20",
        platform: Platform.PASSLINE,
        ticketUrl: "https://passline.com/nathy-peluso-sesiones",
      },
    }),
  ])

  // ScraperRun de ejemplo
  await prisma.scraperRun.upsert({
    where: { id: "scraperrun-seed-1" },
    update: {},
    create: {
      id: "scraperrun-seed-1",
      platform: "PUNTOTICKET",
      status: ScraperStatus.SUCCESS,
      eventsNew: 8,
      eventsUpdated: 2,
      durationMs: 4200,
      startedAt: new Date(now.getTime() - 60 * 60 * 1000),
      finishedAt: new Date(now.getTime() - 60 * 60 * 1000 + 4200),
    },
  })

  console.log(
    `Seed completed: ${venues.length} venues, ${artists.length} artists, ${events.length} events`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
