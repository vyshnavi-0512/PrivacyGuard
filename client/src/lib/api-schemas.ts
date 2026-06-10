export interface HealthStatus { status: string }
export interface ApiError { error: string }
export interface DeleteResult { success: boolean }
export interface ScanInput { query: string; type: "email" | "username" | "phone" }
export interface Breach { name: string; domain: string; breachDate: string; dataClasses: string[]; riskLevel: "low" | "medium" | "high" | "critical"; description: string; pwnCount?: number | null }
export interface ScanResult { id: string; query: string; type: "email" | "username" | "phone"; scannedAt: string; breachCount: number; riskScore: number; riskLevel: "safe" | "low" | "medium" | "high" | "critical"; breaches: Breach[]; exposedDataTypes: string[] }
export interface ScanSummary { id: string; query: string; type: "email" | "username" | "phone"; scannedAt: string; breachCount: number; riskLevel: "safe" | "low" | "medium" | "high" | "critical"; riskScore: number }
export interface AdvisorInput { scanId: string; breaches: Breach[]; exposedDataTypes: string[] }
export interface Recommendation { priority: "urgent" | "high" | "medium" | "low"; category: "password" | "account" | "monitoring" | "financial" | "identity" | "device"; title: string; description: string; actionSteps: string[] }
export interface AdvisorResponse { scanId: string; overallAssessment: string; riskSummary: string; recommendations: Recommendation[]; generatedAt: string }
export interface DashboardSummary {
  totalScans: number;
  totalBreachesFound: number;
  uniqueEmailsScanned: number;
  averageRiskScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  safeCount: number;
  emailCount: number;
  usernameCount: number;
  phoneCount: number;
  mostRecentScan: string | null;
  topExposedDataTypes: string[];
  monitoredCount: number;
  activeAlerts: number;
}
export interface BreachCategory { category: string; count: number; percentage: number }
export interface MonitorInput { email: string }
export interface Monitor { id: string; email: string; createdAt: string; lastScannedAt: string | null; lastBreachCount: number; lastRiskLevel: string | null; status: "active" | "paused" }
export interface BreachAlert { id: string; monitorId: string; email: string; detectedAt: string; newBreachCount: number; previousBreachCount: number; riskLevel: "safe" | "low" | "medium" | "high" | "critical"; isRead: boolean }
export interface PasswordCheckInput { password: string }
export interface PasswordCheckResult { pwned: boolean; count: number; severity: "safe" | "low" | "medium" | "high" | "critical"; hashPrefix: string }
export interface MonitorScanResult { monitorId: string; email: string; breachCount: number; riskLevel: "safe" | "low" | "medium" | "high" | "critical"; riskScore: number; newAlerts: number; scannedAt: string }
