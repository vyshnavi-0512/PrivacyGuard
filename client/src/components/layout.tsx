import { Link, useLocation } from "wouter";
import { Shield, LayoutDashboard, History, Search, Terminal, Eye, KeyRound, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/../firebase";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
export function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { user, loading } = useAuth();

  const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/scan", label: "Threat Scan", icon: Search },
    { href: "/monitoring", label: "Monitoring", icon: Eye },
    { href: "/passwords", label: "Password Check", icon: KeyRound },
    { href: "/history", label: "Scan History", icon: History },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Shield className="w-6 h-6 text-primary mr-3" />
          <span className="font-display font-bold text-lg tracking-wider text-primary uppercase">
            Privacy Guard
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center px-3 py-2.5 rounded-sm text-sm font-mono transition-colors cursor-pointer ${
                    active
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border bg-muted/30 space-y-3">
          <div className="flex items-center text-xs font-mono text-muted-foreground">
            <Terminal className="w-4 h-4 mr-2" />
            <span>SYS_ONLINE</span>
          </div>

          {user && !loading && (
            <button
              type="button"
              onClick={async () => {
                trackEvent("logout", "/logout", {
                  source: "privacyguard",
                });
                try {
                  await signOut(auth);
                } finally {
                  navigate("/login", { replace: true });
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-sm border border-border bg-card/40 hover:bg-card/60 text-sm font-mono text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-8 z-10 sticky top-0">
          <h1 className="font-display text-xl font-semibold tracking-wide text-foreground">
            {navItems.find(i => i.href === location)?.label || "Dashboard"}
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-[1900px] min-h-[850px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
