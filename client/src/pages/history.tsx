import React from "react";
import { Link } from "wouter";
import { useGetScanHistory } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, ShieldAlert, RefreshCw, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function HistoryPage() {
  const { data: history, isLoading } = useGetScanHistory();

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64 mb-8" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold tracking-wide flex items-center">
          <History className="w-6 h-6 mr-3 text-primary" />
          Scan History Log
        </h1>
        <Link href="/scan">
          <Button variant="outline" className="font-mono text-xs uppercase tracking-widest border-primary/20 hover:bg-primary/10 hover:text-primary">
            <Search className="w-4 h-4 mr-2" />
            New Scan
          </Button>
        </Link>
      </div>

      {!history || history.length === 0 ? (
        <Card className="bg-card/40 border-border/50 backdrop-blur py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <History className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-display text-xl font-semibold mb-2 text-muted-foreground">No Scan History</h3>
            <p className="font-mono text-sm text-muted-foreground max-w-md mb-6">
              You haven't run any data breach scans yet. Initiate your first scan to begin monitoring your digital footprint.
            </p>
            <Link href="/scan">
              <Button className="font-display uppercase tracking-widest">
                Initiate First Scan
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((scan) => (
            <Card key={scan.id} className="bg-card/40 border-border/50 hover:bg-card/60 transition-colors group">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`p-3 rounded-sm shrink-0 ${
                    scan.breachCount > 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                  }`}>
                    {scan.breachCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-mono font-medium text-lg text-foreground flex items-center gap-2">
                      {scan.query}
                      <Badge variant="secondary" className="text-[10px] uppercase h-5 bg-secondary/50">
                        {scan.type}
                      </Badge>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      <span>{formatDistanceToNow(new Date(scan.scannedAt), { addSuffix: true })}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className={scan.breachCount > 0 ? "text-destructive font-semibold" : "text-primary"}>
                        {scan.breachCount} breaches found
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  <div className="hidden sm:block text-right mr-4">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Risk Score</div>
                    <div className={`font-mono font-bold text-lg ${
                      scan.riskScore >= 75 ? "text-destructive" :
                      scan.riskScore >= 50 ? "text-orange-500" :
                      scan.riskScore >= 25 ? "text-yellow-500" :
                      "text-primary"
                    }`}>
                      {scan.riskScore}
                    </div>
                  </div>
                  
                  <Link href={`/scan?query=${encodeURIComponent(scan.query)}&type=${scan.type}`}>
                    <Button variant="secondary" size="sm" className="w-full sm:w-auto font-mono text-xs uppercase tracking-widest bg-secondary hover:bg-secondary/80">
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Re-scan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
