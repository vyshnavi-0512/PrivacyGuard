import { Router, type Request, type Response } from "express";
import { db, monitorsTable, alertsTable } from "../db/index.js";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { runMonitorScan } from "../lib/scanner.js";
import { requireFirebaseAuth } from "../lib/auth-middleware.js";

const router = Router();
router.use(requireFirebaseAuth);
const CreateMonitorBody = z.object({ email: z.string().email() });

router.get("/monitors", async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid;
  if (!firebaseUid) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const monitors = await db.select().from(monitorsTable).where(eq(monitorsTable.firebaseUid, firebaseUid)).orderBy(desc(monitorsTable.createdAt));
    res.json(monitors.map((m) => ({ id: String(m.id), email: m.email, createdAt: m.createdAt.toISOString(), lastScannedAt: m.lastScannedAt?.toISOString() ?? null, lastBreachCount: m.lastBreachCount, lastRiskLevel: m.lastRiskLevel ?? null, status: m.status })));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/monitors", async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid;
  if (!firebaseUid) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const parsed = CreateMonitorBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { email } = parsed.data;
  try {
    const [inserted] = await db.insert(monitorsTable).values({ firebaseUid, email }).onConflictDoNothing().returning();
    if (!inserted) { res.status(400).json({ error: "Email is already being monitored" }); return; }
    try { await runMonitorScan(inserted.id, email, null); } catch { /* don't fail monitor creation */ }
    const [updated] = await db.select().from(monitorsTable).where(eq(monitorsTable.id, inserted.id)).limit(1);
    res.status(201).json({ id: String(updated.id), email: updated.email, createdAt: updated.createdAt.toISOString(), lastScannedAt: updated.lastScannedAt?.toISOString() ?? null, lastBreachCount: updated.lastBreachCount, lastRiskLevel: updated.lastRiskLevel ?? null, status: updated.status });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/monitors/:id", async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid;
  if (!firebaseUid) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idParam, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Monitor not found" }); return; }
  try {
    const deleted = await db.delete(monitorsTable).where(and(eq(monitorsTable.id, id), eq(monitorsTable.firebaseUid, firebaseUid))).returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Monitor not found" }); return; }
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/monitors/alerts", async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid;
  if (!firebaseUid) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const alerts = await db.select({
      id: alertsTable.id,
      monitorId: alertsTable.monitorId,
      email: alertsTable.email,
      detectedAt: alertsTable.detectedAt,
      newBreachCount: alertsTable.newBreachCount,
      previousBreachCount: alertsTable.previousBreachCount,
      riskLevel: alertsTable.riskLevel,
      isRead: alertsTable.isRead,
    }).from(alertsTable)
      .innerJoin(monitorsTable, eq(alertsTable.monitorId, monitorsTable.id))
      .where(eq(monitorsTable.firebaseUid, firebaseUid))
      .orderBy(desc(alertsTable.detectedAt))
      .limit(50);
    res.json(alerts.map((a) => ({ id: String(a.id), monitorId: String(a.monitorId), email: a.email, detectedAt: a.detectedAt.toISOString(), newBreachCount: a.newBreachCount, previousBreachCount: a.previousBreachCount, riskLevel: a.riskLevel, isRead: a.isRead })));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/monitors/:id/scan", async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid;
  if (!firebaseUid) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idParam, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Monitor not found" }); return; }
  try {
    const [monitor] = await db.select().from(monitorsTable).where(and(eq(monitorsTable.id, id), eq(monitorsTable.firebaseUid, firebaseUid)));
    if (!monitor) { res.status(404).json({ error: "Monitor not found" }); return; }
    const result = await runMonitorScan(monitor.id, monitor.email, monitor.lastBreachCount);
    res.json({ monitorId: String(monitor.id), email: monitor.email, breachCount: result.breachCount, riskLevel: result.riskLevel, riskScore: result.riskScore, newAlerts: result.newAlerts, scannedAt: result.scannedAt });
  } catch (err) { console.error(err); res.status(500).json({ error: "Scan failed. Please try again." }); }
});

export default router;
