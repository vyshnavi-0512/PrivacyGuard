import { db, monitorsTable, alertsTable, scansTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { logger } from "./logger.js";

type RiskLevel = "low" | "medium" | "high" | "critical";
type ScanRiskLevel = "safe" | "low" | "medium" | "high" | "critical";

function getRiskLevelFromCount(count: number): RiskLevel {
  if (count >= 50) return "critical";
  if (count >= 10) return "high";
  if (count >= 3) return "medium";
  return "low";
}

function calculateRiskScore(count: number): number {
  if (count === 0) return 0;
  if (count >= 50) return 95;
  if (count >= 20) return 80;
  if (count >= 10) return 65;
  if (count >= 5) return 45;
  if (count >= 2) return 30;
  return 15;
}

function getScanRiskLevel(score: number): ScanRiskLevel {
  if (score === 0) return "safe";
  if (score <= 15) return "low";
  if (score <= 35) return "medium";
  if (score <= 65) return "high";
  return "critical";
}

async function lookupCOMB(query: string): Promise<{ exactMatches: number }> {
  const url = `https://api.proxynova.com/comb?query=${encodeURIComponent(query)}&limit=100`;
  const res = await fetch(url, {
    headers: { "User-Agent": "PrivacyGuard/1.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`COMB API error: ${res.status}`);
  const data = (await res.json()) as { count?: number; lines?: string[] };
  const lines = data.lines ?? [];
  const prefix = query.toLowerCase() + ":";
  const exactMatches = lines.filter((l: string) => l.toLowerCase().startsWith(prefix)).length;
  return { exactMatches };
}

function buildBreaches(exactMatches: number) {
  if (exactMatches === 0) return [];
  const riskLevel = getRiskLevelFromCount(exactMatches);
  return [
    {
      name: "Collection of Many Breaches (COMB)",
      domain: "various",
      breachDate: "2021-02-02",
      dataClasses: ["Email addresses", "Passwords"],
      riskLevel,
      description: `Your email was found ${exactMatches} time${exactMatches !== 1 ? "s" : ""} in the COMB dataset — a compilation of over 3.2 billion unique credential pairs aggregated from thousands of data breaches.`,
      pwnCount: 3200000000,
    },
    ...(exactMatches >= 3
      ? [
          {
            name: "Credential Stuffing Database",
            domain: "various",
            breachDate: "2023-01-01",
            dataClasses: ["Email addresses", "Passwords", "Usernames"],
            riskLevel: riskLevel === "critical" ? ("critical" as const) : ("high" as const),
            description: `Multiple credential pairs tied to your email are circulating in credential-stuffing attack lists.`,
            pwnCount: null,
          },
        ]
      : []),
  ];
}

export async function runMonitorScan(
  monitorId: number,
  email: string,
  previousBreachCount: number | null
): Promise<{ breachCount: number; riskLevel: ScanRiskLevel; riskScore: number; newAlerts: number; scannedAt: string }> {
  const { exactMatches } = await lookupCOMB(email);
  const breaches = buildBreaches(exactMatches);
  const exposedDataTypes = [...new Set(breaches.flatMap((b) => b.dataClasses))];
  const riskScore = calculateRiskScore(exactMatches);
  const riskLevel = getScanRiskLevel(riskScore);
  const breachCount = breaches.length;
  const scannedAt = new Date();

  await db.insert(scansTable).values({ query: email, type: "email", breachCount, riskScore, riskLevel, breaches: breaches as any, exposedDataTypes });
  await db.update(monitorsTable).set({ lastScannedAt: scannedAt, lastBreachCount: breachCount, lastRiskLevel: riskLevel }).where(eq(monitorsTable.id, monitorId));

  let newAlerts = 0;
  if (previousBreachCount !== null && breachCount > previousBreachCount) {
    await db.insert(alertsTable).values({ monitorId, email, newBreachCount: breachCount, previousBreachCount, riskLevel });
    newAlerts = 1;
    logger.info({ email, previousBreachCount, breachCount }, "New breach alert created");
  }

  return { breachCount, riskLevel, riskScore, newAlerts, scannedAt: scannedAt.toISOString() };
}
