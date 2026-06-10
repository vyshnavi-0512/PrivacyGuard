import { pgTable, text, serial, integer, timestamp, jsonb, boolean, uniqueIndex } from "drizzle-orm/pg-core";

export const scansTable = pgTable("scans", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid"),
  query: text("query").notNull(),
  type: text("type").notNull(),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
  breachCount: integer("breach_count").notNull().default(0),
  riskScore: integer("risk_score").notNull().default(0),
  riskLevel: text("risk_level").notNull().default("safe"),
  breaches: jsonb("breaches").notNull().default([]),
  exposedDataTypes: jsonb("exposed_data_types").notNull().default([]),
});

export const monitorsTable = pgTable("monitors", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid"),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastScannedAt: timestamp("last_scanned_at"),
  lastBreachCount: integer("last_breach_count").notNull().default(0),
  lastRiskLevel: text("last_risk_level"),
  status: text("status").notNull().default("active"),
}, (table) => ({
  ownerEmailUnique: uniqueIndex("monitors_firebase_uid_email_unique").on(table.firebaseUid, table.email),
}));

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  monitorId: integer("monitor_id").notNull(),
  email: text("email").notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  newBreachCount: integer("new_breach_count").notNull().default(0),
  previousBreachCount: integer("previous_breach_count").notNull().default(0),
  riskLevel: text("risk_level").notNull().default("safe"),
  isRead: boolean("is_read").notNull().default(false),
});
