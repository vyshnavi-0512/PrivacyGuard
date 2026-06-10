import { db, monitorsTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { runMonitorScan } from "./scanner.js";
import { logger } from "./logger.js";

const INTERVAL_MS = 24 * 60 * 60 * 1000;

async function runAllMonitors() {
  logger.info("Running scheduled monitor scans");
  try {
    const monitors = await db.select().from(monitorsTable).where(eq(monitorsTable.status, "active"));
    for (const monitor of monitors) {
      try {
        const result = await runMonitorScan(monitor.id, monitor.email, monitor.lastBreachCount);
        logger.info({ email: monitor.email, breachCount: result.breachCount }, "Monitor scan complete");
      } catch (err) {
        logger.error({ err, email: monitor.email }, "Monitor scan failed");
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    logger.info({ count: monitors.length }, "Scheduled scans finished");
  } catch (err) {
    logger.error({ err }, "Scheduler run failed");
  }
}

export function startScheduler() {
  setTimeout(() => {
    runAllMonitors().catch((err) => logger.error({ err }, "Initial scheduler run failed"));
  }, 10_000);
  setInterval(() => {
    runAllMonitors().catch((err) => logger.error({ err }, "Scheduled run failed"));
  }, INTERVAL_MS);
  logger.info({ intervalHours: 24 }, "Monitor scheduler started");
}
