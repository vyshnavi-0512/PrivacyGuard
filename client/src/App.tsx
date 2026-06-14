import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import DashboardPage from "@/pages/dashboard";
import ScanPage from "@/pages/scan";
import MonitoringPage from "@/pages/monitoring";
import HistoryPage from "@/pages/history";
import PasswordsPage from "@/pages/passwords";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trackEvent } from "./lib/analytics";


const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route
        component={() => (
          <ProtectedRoute>
            <Layout>
              <Switch>
                <Route path="/" component={DashboardPage} />
                <Route path="/scan" component={ScanPage} />
                <Route path="/monitoring" component={MonitoringPage} />
                <Route path="/passwords" component={PasswordsPage} />
                <Route path="/history" component={HistoryPage} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          </ProtectedRoute>
        )}
      />
    </Switch>
  );
}

function AnalyticsTracker() {
  const [location] = useLocation();

  useEffect(() => {
    console.log("Tracker fired:", location);

    trackEvent("page_view", location, {
      source: "privacyguard",
    });
  }, [location]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <WouterRouter>
  <AnalyticsTracker />
  <Router />
</WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
