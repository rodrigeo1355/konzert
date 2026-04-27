import { registerScraperSchedules } from "./queues/scraper"
import { scraperWorker } from "./workers/scraper"
import { emailWorker } from "./workers/email"

async function main() {
  console.log("Workers starting...")

  await registerScraperSchedules()

  scraperWorker.on("completed", (job) => {
    console.log(`[scraper] job ${job.id} completed`)
  })
  scraperWorker.on("failed", (job, err) => {
    console.error(`[scraper] job ${job?.id} failed:`, err.message)
  })

  emailWorker.on("completed", (job) => {
    console.log(`[email] job ${job.id} completed`)
  })
  emailWorker.on("failed", (job, err) => {
    console.error(`[email] job ${job?.id} failed:`, err.message)
  })

  console.log("Workers ready. Scraper scheduled:", process.env.SCRAPER_CRON ?? "0 */6 * * *")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
