import { Router } from "express";
import healthRouter from "./health.js";
import scansRouter from "./scans.js";
import advisorRouter from "./advisor.js";
import dashboardRouter from "./dashboard.js";
import monitorsRouter from "./monitors.js";
import passwordsRouter from "./passwords.js";

const router = Router();

router.use(healthRouter);
router.use(scansRouter);
router.use(advisorRouter);
router.use(dashboardRouter);
router.use(monitorsRouter);
router.use(passwordsRouter);

export default router;
