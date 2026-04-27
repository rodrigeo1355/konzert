import { prisma } from "@konzert/database"
import { enqueueEmailNotification, type EmailJobType } from "./queues/email"

const BATCH_SIZE = 100

export async function notifyAffectedUsers(eventId: string, type: EmailJobType) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { artists: { select: { artistId: true } } },
  })

  if (!event) return

  const artistIds = event.artists.map((ea) => ea.artistId)
  if (artistIds.length === 0) return

  const prefField =
    type === "EVENT_ANNOUNCED" ? "notifyEventAnnounced" : "notifySaleOpened"

  let skip = 0
  while (true) {
    const followers = await prisma.userArtist.findMany({
      where: {
        artistId: { in: artistIds },
        user: { [prefField]: true, deletedAt: null },
      },
      select: { userId: true },
      distinct: ["userId"],
      skip,
      take: BATCH_SIZE,
    })

    if (followers.length === 0) break

    await Promise.all(
      followers.map(({ userId }) => enqueueEmailNotification({ type, userId, eventId }))
    )

    if (followers.length < BATCH_SIZE) break
    skip += BATCH_SIZE
  }
}
