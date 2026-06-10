import "dotenv/config";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { startScheduler } from "./lib/scheduler.js";

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  logger.info({ port }, "Privacy Guard API server listening");
  startScheduler();
});
