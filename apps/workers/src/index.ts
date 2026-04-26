import { scraperQueue } from "./queues/scraper"
import { scraperWorker } from "./workers/scraper"

async function main() {
  console.log("Workers starting...")

  scraperWorker.on("completed", (job) => {
    console.log(`[scraper] job ${job.id} completed`)
  })

  scraperWorker.on("failed", (job, err) => {
    console.error(`[scraper] job ${job?.id} failed:`, err.message)
  })

  console.log("Workers ready")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
