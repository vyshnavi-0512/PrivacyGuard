import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListMonitors, 
  getListMonitorsQueryKey,
  useCreateMonitor,
  useDeleteMonitor,
  useListAlerts,
  getListAlertsQueryKey,
  useTriggerMonitorScan
} from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, RefreshCw, AlertCircle, Shield, Plus, Bell, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MonitoringPage() {
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: monitors, isLoading: isLoadingMonitors } = useListMonitors();
  const { data: alerts, isLoading: isLoadingAlerts } = useListAlerts();

  const createMonitor = useCreateMonitor();
  const deleteMonitor = useDeleteMonitor();
  const triggerScan = useTriggerMonitorScan();

  const handleAddMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    createMonitor.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          setEmail("");
          queryClient.invalidateQueries({ queryKey: getListMonitorsQueryKey() });
          toast({ title: "Monitor Added", description: `Now watching ${email}` });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err?.response?.data?.error || "Failed to add monitor", variant: "destructive" });
        }
      }
    );
  };

  const handleDeleteMonitor = (id: string) => {
    deleteMonitor.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMonitorsQueryKey() });
          toast({ title: "Monitor Deleted", description: "Email has been removed from monitoring." });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: "Failed to delete monitor", variant: "destructive" });
        }
      }
    );
  };

  const handleTriggerScan = (id: string) => {
    triggerScan.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMonitorsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
          toast({ title: "Scan Complete", description: "Monitor scan has finished." });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: "Failed to run scan", variant: "destructive" });
        }
      }
    );
  };

  const sortedAlerts = alerts ? [...alerts].sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()) : [];

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: Watched Emails */}
        <Card className="bg-card/40 border-border/50 backdrop-blur flex flex-col h-full">
          <CardHeader>
            <CardTitle className="font-display font-semibold text-lg tracking-wide flex items-center">
              <Eye className="w-5 h-5 mr-2 text-primary" />
              Watched Emails
            </CardTitle>
            <CardDescription className="font-mono">Monitor specific emails for new breaches.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <form onSubmit={handleAddMonitor} className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter email to monitor..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-mono bg-background"
                required
                data-testid="input-monitor-email"
              />
              <Button type="submit" disabled={createMonitor.isPending} data-testid="button-add-monitor">
                {createMonitor.isPending ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Monitor
              </Button>
            </form>

            <div className="space-y-4 flex-1">
              {isLoadingMonitors ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : monitors && monitors.length > 0 ? (
                monitors.map((monitor) => (
                  <div key={monitor.id} className="p-4 border border-border/50 bg-background/50 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" data-testid={`card-monitor-${monitor.id}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold">{monitor.email}</span>
                        <Badge variant="outline" className={`text-[10px] uppercase ${monitor.status === 'active' ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}`}>
                          {monitor.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                        <span>Last scan: {monitor.lastScannedAt ? formatDistanceToNow(new Date(monitor.lastScannedAt), { addSuffix: true }) : 'Never'}</span>
                        {monitor.lastRiskLevel && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              Risk: 
                              <Badge variant="outline" className={`text-[9px] uppercase px-1 py-0 ${
                                monitor.lastRiskLevel === 'critical' ? "border-destructive text-destructive" :
                                monitor.lastRiskLevel === 'high' ? "border-orange-500 text-orange-500" :
                                monitor.lastRiskLevel === 'medium' ? "border-yellow-500 text-yellow-500" :
                                "border-primary text-primary"
                              }`}>
                                {monitor.lastRiskLevel}
                              </Badge>
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className={`${monitor.lastBreachCount > 0 ? 'text-destructive font-bold' : ''}`}>
                          {monitor.lastBreachCount} {monitor.lastBreachCount === 1 ? 'breach' : 'breaches'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex-1 sm:flex-none font-mono text-xs" 
                        onClick={() => handleTriggerScan(monitor.id)}
                        disabled={triggerScan.isPending && triggerScan.variables?.id === monitor.id}
                        data-testid={`button-scan-${monitor.id}`}
                      >
                        <RefreshCw className={`w-3 h-3 mr-2 ${triggerScan.isPending && triggerScan.variables?.id === monitor.id ? 'animate-spin' : ''}`} />
                        Scan Now
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteMonitor(monitor.id)}
                        disabled={deleteMonitor.isPending && deleteMonitor.variables?.id === monitor.id}
                        data-testid={`button-delete-${monitor.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center text-muted-foreground bg-background/20 rounded-md border border-dashed border-border/50 h-full">
                  <Shield className="w-8 h-8 mb-3 opacity-20" />
                  <p className="font-mono text-sm">No emails being monitored.</p>
                  <p className="font-mono text-xs mt-1">Add one above.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Breach Alerts */}
        <Card className="bg-card/40 border-border/50 backdrop-blur flex flex-col h-full">
          <CardHeader>
            <CardTitle className="font-display font-semibold text-lg tracking-wide flex items-center">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              Breach Alerts
            </CardTitle>
            <CardDescription className="font-mono">Notifications for newly detected exposures.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {isLoadingAlerts ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : sortedAlerts.length > 0 ? (
                sortedAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 border rounded-md flex items-start gap-4 ${!alert.isRead ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-background/50'}`} data-testid={`card-alert-${alert.id}`}>
                    <div className="mt-1">
                      {!alert.isRead ? (
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono font-bold">{alert.email}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className={`text-[10px] uppercase font-mono ${
                          alert.riskLevel === 'critical' ? "border-destructive text-destructive bg-destructive/10" :
                          alert.riskLevel === 'high' ? "border-orange-500 text-orange-500 bg-orange-500/10" :
                          alert.riskLevel === 'medium' ? "border-yellow-500 text-yellow-500 bg-yellow-500/10" :
                          "border-primary text-primary bg-primary/10"
                        }`}>
                          {alert.riskLevel}
                        </Badge>
                        <span className="font-mono text-xs flex items-center text-muted-foreground">
                          <AlertCircle className="w-3 h-3 mr-1 text-destructive" />
                          <span className="font-bold text-foreground">{alert.previousBreachCount} &rarr; {alert.newBreachCount}</span> breaches
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center text-muted-foreground bg-background/20 rounded-md border border-dashed border-border/50 h-full">
                  <Bell className="w-8 h-8 mb-3 opacity-20" />
                  <p className="font-mono text-sm">No alerts yet.</p>
                  <p className="font-mono text-xs mt-1">Monitored emails will appear here when new breaches are detected.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
