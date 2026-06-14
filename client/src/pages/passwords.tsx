import React, { useState } from "react";
import { useCheckPassword } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, KeyRound, Activity, Eye, EyeOff, Lock, AlertTriangle, Fingerprint } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function PasswordsPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const checkPassword = useCheckPassword();

  const handleCheck = (e: React.FormEvent) => {
    trackEvent("password_checked", "/passwords", {
      source: "privacyguard",
    });
    e.preventDefault();
    if (!password) return;
    checkPassword.mutate(
      { data: { password } },
      {
        onSuccess: (data) => {
          setResult(data);
        }
      }
    );
  };

  const handleReset = () => {
    setPassword("");
    setResult(null);
    checkPassword.reset();
  };

  return (
    <div className="space-y-8 pb-12 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold tracking-wide text-foreground">
            Password Checker
          </h1>
          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 font-mono text-xs py-1 flex items-center gap-1.5 shadow-[0_0_10px_rgba(var(--primary),0.1)]">
            <Fingerprint className="w-3 h-3" />
            k-anonymity protected
          </Badge>
        </div>
        <p className="text-muted-foreground font-mono text-sm leading-relaxed border-l-2 border-primary/30 pl-4 py-1 mt-2">
          Your password is never sent anywhere. We hash it locally and only send the first 5 characters of that hash to check against 1 billion leaked passwords.
        </p>
      </div>

      {!result ? (
        <Card className="bg-card/40 border-border/50 backdrop-blur relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <KeyRound className="w-48 h-48" />
          </div>
          <CardHeader>
            <CardTitle className="font-display font-semibold text-lg tracking-wide flex items-center">
              <Lock className="w-5 h-5 mr-2 text-primary" />
              Verify Credentials
            </CardTitle>
            <CardDescription className="font-mono">Enter a password to check its exposure status.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheck} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter password..." 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono bg-background/50 border-border/50 text-lg py-6 pr-12 focus-visible:ring-primary/50"
                    required
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                size="lg"
                className="w-full font-display font-bold tracking-wider text-base shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-shadow"
                disabled={checkPassword.isPending || !password} 
                data-testid="button-check-password"
              >
                {checkPassword.isPending ? (
                  <>
                    <Activity className="w-5 h-5 mr-2 animate-spin" />
                    ANALYZING HASH...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    CHECK PASSWORD
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!result.pwned ? (
            <Card className="bg-primary/5 border-primary/20 backdrop-blur relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-primary">
                <Shield className="w-48 h-48" />
              </div>
              <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center z-10 relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-display font-bold text-4xl tracking-widest text-primary mb-4 drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">SECURE</h2>
                <p className="font-mono text-lg text-foreground/90 max-w-lg mb-8">
                  This password has not been found in any known data breach.
                </p>
                <div className="font-mono text-xs text-muted-foreground bg-background/50 px-4 py-2 rounded-sm border border-border/50 mb-8">
                  Hash prefix sent: {result.hashPrefix}
                </div>
                <Button variant="outline" onClick={handleReset} className="font-mono border-primary/30 hover:bg-primary/10">
                  Check Another Password
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-destructive/5 border-destructive/30 backdrop-blur relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-destructive">
                <ShieldAlert className="w-48 h-48" />
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-destructive shadow-[0_0_10px_rgba(var(--destructive),0.8)]" />
              <CardContent className="pt-10 pb-8 flex flex-col items-center text-center z-10 relative">
                <div className="w-24 h-24 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(var(--destructive),0.4)] animate-pulse">
                  <AlertTriangle className="w-12 h-12 text-destructive" />
                </div>
                
                <Badge variant="outline" className={`mb-4 px-3 py-1 font-mono text-sm tracking-wider uppercase border-destructive text-destructive bg-destructive/10`}>
                  {result.severity} RISK EXPOSURE
                </Badge>

                <h2 className="font-display font-bold text-4xl tracking-widest text-destructive mb-2 drop-shadow-[0_0_10px_rgba(var(--destructive),0.5)]">COMPROMISED</h2>
                
                <div className="my-6 space-y-4">
                  <p className="font-mono text-xl text-foreground">
                    Found in <span className="font-bold text-destructive text-2xl">{result.count.toLocaleString()}</span> breach records
                  </p>
                  
                  {result.count >= 100000 && (
                    <div className="bg-destructive/20 border border-destructive/40 text-destructive-foreground p-3 rounded-md max-w-md mx-auto font-mono text-sm">
                      <span className="font-bold block mb-1">CRITICAL WARNING:</span>
                      This password is widely circulated in hacker dictionaries. It takes seconds to crack in a brute-force attack.
                    </div>
                  )}
                </div>

                <div className="border-t border-border/50 w-full max-w-lg my-6 pt-6">
                  <p className="font-display font-semibold text-lg text-foreground/90 mb-6">
                    Change this password immediately on every service where you use it.
                  </p>
                  
                  <div className="font-mono text-xs text-muted-foreground bg-background/50 px-4 py-2 rounded-sm border border-border/50 mb-8 max-w-xs mx-auto">
                    Hash prefix sent: {result.hashPrefix}
                  </div>
                  
                  <Button variant="default" onClick={handleReset} className="font-mono bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_15px_rgba(var(--destructive),0.3)]">
                    Check Another Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
