import { Queue } from "bullmq"
import { redis } from "../redis"

export const EMAIL_QUEUE = "email"

export type EmailJobType = "EVENT_ANNOUNCED" | "SALE_OPENED"

export interface EmailJobData {
  type: EmailJobType
  userId: string
  eventId: string
}

// Lower number = higher priority in BullMQ
const JOB_PRIORITY: Record<EmailJobType, number> = {
  SALE_OPENED: 1,
  EVENT_ANNOUNCED: 2,
}

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 60_000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 1000 },
  },
})

export async function enqueueEmailNotification(data: EmailJobData) {
  await emailQueue.add(data.type, data, {
    priority: JOB_PRIORITY[data.type],
    jobId: `email-${data.userId}-${data.eventId}-${data.type}`,
  })
}
