import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import CyberBackground from "@/components/CyberBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { auth, googleProvider } from "@/../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { Shield, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const particleNodes = [
  { left: 10, top: 18, size: "7px", delay: "0s" },
  { left: 22, top: 72, size: "6px", delay: "1.2s" },
  { left: 34, top: 32, size: "10px", delay: "0.6s" },
  { left: 48, top: 16, size: "7px", delay: "1.8s" },
  { left: 64, top: 24, size: "9px", delay: "0.3s" },
  { left: 78, top: 38, size: "6px", delay: "1.4s" },
  { left: 86, top: 70, size: "8px", delay: "0.8s" },
  { left: 74, top: 82, size: "7px", delay: "2s" },
  { left: 18, top: 48, size: "5px", delay: "1.6s" },
  { left: 56, top: 78, size: "6px", delay: "0.9s" },
  { left: 90, top: 14, size: "5px", delay: "1.4s" },
  { left: 40, top: 88, size: "8px", delay: "1.1s" },
];

const particleLines = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 7], [2, 7], [1, 4], [8, 2], [8, 3], [9, 4], [9, 6], [10, 5], [11, 7], [11, 9],
];

const heroNodes = [
  { left: 18, top: 26 },
  { left: 34, top: 38 },
  { left: 54, top: 24 },
  { left: 70, top: 38 },
  { left: 60, top: 70 },
  { left: 82, top: 64 },
];

const heroLines = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 4], [2, 5], [1, 3],
];

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerMove = (event: MouseEvent) => {
      const x = ((event.clientX / window.innerWidth) - 0.5) * 20;
      const y = ((event.clientY / window.innerHeight) - 0.5) * 20;
      setPointerOffset({ x, y });
    };

    const onPointerLeave = () => setPointerOffset({ x: 0, y: 0 });

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("mouseleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mouseleave", onPointerLeave);
    };
  }, []);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
      
        trackEvent("signup", "/login", {
          source: "privacyguard",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      
        trackEvent("login", "/login", {
          source: "privacyguard",
        });
      }
      
      navigate("/", { replace: true });
    } catch (err: any) {
      trackEvent("error", "/login", {
        source: "privacyguard",
        message: err?.message ?? "Authentication failed",
      });
    
      setError(err?.message ?? "Authentication failed.");
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setSubmitting(true);

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithPopup(auth, googleProvider);
      trackEvent("login", "/login", {
        source: "privacyguard",
        provider: "google",
      });
      navigate("/", { replace: true });
    } catch (err: any) {
      trackEvent("error", "/login", {
        source: "privacyguard",
        message: err?.message ?? "Google sign-in failed",
      });
      setError(err?.message ?? "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  // If already authenticated, send user to app root.
  if (user) {
    navigate("/", { replace: true });
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0f1c] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <style>{`
        @keyframes floatNode {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -10px, 0) scale(1.08); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.12); }
          50% { box-shadow: 0 0 35px 8px rgba(0, 255, 136, 0.18); }
        }
        @keyframes driftOrb {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.2; }
          50% { transform: translate3d(18px, -16px, 0) scale(1.08); opacity: 0.32; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(0px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(0px) rotate(-360deg); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sweepRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(0.94); opacity: 0.28; }
          50% { transform: scale(1.04); opacity: 0.42; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,255,136,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(0,212,255,0.15),_transparent_30%),linear-gradient(135deg,_#0a0f1c_0%,_#111827_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(0,255,136,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.08)_1px,transparent_1px)] [background-size:88px_88px]" />
        <div className="absolute inset-0">
          <div className="absolute -left-10 top-12 h-56 w-56 rounded-full bg-[#00ff88]/15 blur-3xl" style={{ animation: "driftOrb 20s ease-in-out infinite" }} />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#00d4ff]/15 blur-3xl" style={{ animation: "driftOrb 24s ease-in-out infinite reverse" }} />
        </div>
        <div className="absolute inset-0" style={{ transform: `translate3d(${pointerOffset.x * 0.8}px, ${pointerOffset.y * 0.8}px, 0) rotateX(${pointerOffset.y * -0.35}deg) rotateY(${pointerOffset.x * 0.35}deg)` }}>
          <svg className="absolute inset-0 h-full w-full opacity-90" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <g stroke="rgba(0,212,255,0.18)" strokeWidth="0.18" fill="none">
              {particleLines.map(([from, to], index) => {
                const fromNode = particleNodes[from];
                const toNode = particleNodes[to];
                return (
                  <line
                    key={`line-${index}`}
                    x1={fromNode.left}
                    x2={toNode.left}
                    y1={fromNode.top}
                    y2={toNode.top}
                  />
                );
              })}
            </g>
          </svg>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_0%,_transparent_70%)]" />
        {particleNodes.map((node, index) => (
          <div
            key={`node-${index}`}
            className="absolute rounded-full border border-[#00ff88]/35 bg-[#00ff88]/20"
            style={{
              left: `${node.left}%`,
              top: `${node.top}%`,
              width: node.size,
              height: node.size,
              transform: `translate3d(${pointerOffset.x * (index % 2 === 0 ? 0.15 : -0.1)}px, ${pointerOffset.y * (index % 2 === 0 ? -0.12 : 0.14)}px, 0)`,
              animation: `floatNode 7s ease-in-out infinite`,
              animationDelay: node.delay,
              animationName: "floatNode",
            }}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[320px] w-[320px] sm:h-[430px] sm:w-[430px]">
            <div className="absolute inset-0 rounded-full border border-[#00ff88]/20" style={{ transform: `rotate(${pointerOffset.x * 0.25}deg)` }} />
            <div className="absolute inset-6 rounded-full border border-[#00d4ff]/20" style={{ transform: `rotate(${-pointerOffset.x * 0.2}deg)` }} />
            <div className="absolute inset-12 rounded-full border border-white/10" style={{ animation: "spinSlow 28s linear infinite" }} />
            <div className="absolute inset-[20%] rounded-full border border-[#00ff88]/10" style={{ animation: "pulseRing 7s ease-in-out infinite" }} />
            <div className="absolute inset-[13%] rounded-full border border-[#00d4ff]/10" style={{ animation: "spinSlow 18s linear infinite reverse" }} />
            <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,_rgba(0,255,136,0.14)_0%,_rgba(10,15,28,0.1)_62%,_transparent_100%)]" style={{ transform: `translate3d(${pointerOffset.x * 0.45}px, ${pointerOffset.y * 0.45}px, 0)` }} />
            <div className="absolute inset-0 rounded-full border border-transparent [background:conic-gradient(from_180deg,_rgba(0,255,136,0.05),_rgba(0,212,255,0.2),_rgba(0,255,136,0.05))] opacity-70" style={{ animation: "sweepRotate 16s linear infinite", mask: "radial-gradient(circle, transparent 54%, black 55%)" }} />
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 shadow-[0_0_90px_rgba(0,255,136,0.2)] backdrop-blur-xl" style={{ animation: "pulseGlow 5s ease-in-out infinite" }} />
            <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#00d4ff]/25 bg-[#0a0f1c]/85 shadow-[0_0_70px_rgba(0,212,255,0.24)]" style={{ transform: `translate(-50%, -50%) translate3d(${pointerOffset.x * 0.6}px, ${pointerOffset.y * 0.6}px, 0)` }}>
              <Shield className="h-16 w-16 text-[#00ff88] sm:h-[4.5rem] sm:w-[4.5rem]" />
            </div>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00d4ff]/40 bg-[#00d4ff]/30 shadow-[0_0_16px_rgba(0,212,255,0.35)]"
                style={{
                  animation: `orbit ${16 + index * 2}s linear infinite`,
                  animationDelay: `${index * 0.6}s`,
                  transform: `translate(-50%, -50%) rotate(${index * 60}deg) translateX(${index % 2 === 0 ? 132 : 158}px)`,
                }}
              />
            ))}
            <div className="absolute left-1/2 top-1/2 h-[76%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00ff88]/15" style={{ transform: `translate(-50%, -50%) rotate(${pointerOffset.x * 0.2}deg)` }} />
            <div className="absolute left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" style={{ transform: `translate(-50%, -50%) rotate(${-pointerOffset.x * 0.15}deg)` }} />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-card/70 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:flex-row">
        <div className="relative flex min-h-[420px] flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#00ff88]/10 via-[#0a0f1c]/90 to-[#111827]/90 p-6 sm:p-8 lg:min-h-[620px] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,255,136,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(0,212,255,0.16),_transparent_30%)]" />
          <div className="relative z-10 flex w-full max-w-xl flex-col justify-between gap-6">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.3em] text-slate-300/80">
              <span>Threat intelligence</span>
              <span>Live signal</span>
            </div>

            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00ff88]/20 bg-[#0a0f1c]/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-[#00ff88] backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
                Holographic defense
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                 Monitor your digital footprint before it becomes a problem.
                </h2>
                <p className="mx-auto max-w-md text-sm leading-6 text-slate-300/80 lg:mx-0 lg:max-w-sm">
                  A live security surface for spotting exposure, tracing risk, and acting before it scales.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a0f1c]/70 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.28em] text-slate-400">
                <span>Signal status</span>
                <span>97.4%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 w-[97%] rounded-full bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#00ff88]" />
              </div>
            </div>
          </div>
        </div>
 <CyberBackground />
        <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-8 lg:max-w-xl lg:p-10">
          <Card className="w-full border-border/60 bg-background/80 shadow-none">
            <CardHeader className="space-y-2 px-1 pb-4">
              <CardTitle className="font-display text-2xl tracking-wide text-foreground">
                {mode === "login" ? "Sign in" : "Create account"}
              </CardTitle>
              <CardDescription className="font-mono text-sm leading-6 text-muted-foreground">
                {mode === "login" ? "Access your secure workspace." : "Register to start protecting privacy."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-1">
              {error && (
                <Alert variant="destructive">
                  {error}
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mode === "login" ? "default" : "secondary"}
                  className="w-full"
                  onClick={() => {
                    setError(null);
                    setMode("login");
                  }}
                  disabled={submitting}
                >
                  Sign in
                </Button>
                <Button
                  type="button"
                  variant={mode === "register" ? "default" : "secondary"}
                  className="w-full"
                  onClick={() => {
                    setError(null);
                    setMode("register");
                  }}
                  disabled={submitting}
                >
                  Register
                </Button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Email</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="you@domain.com"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Password</label>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    placeholder="••••••••"
                    required
                    disabled={submitting}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={submitting}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Remember me
                </label>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner className="w-4 h-4" />
                      {mode === "login" ? "Signing in..." : "Creating..."}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      {mode === "login" ? "Sign in" : "Create account"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  OR
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-primary/50 text-foreground hover:bg-primary/10"
                onClick={handleGoogleSignIn}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Connecting...
                  </span>
                ) : (
                  "Continue with Google"
                )}
              </Button>

              <div className="pt-2 text-sm leading-6 text-muted-foreground">
                By continuing, you agree to operate under secure access policies.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
