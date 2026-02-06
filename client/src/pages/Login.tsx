import { useState } from "react";
import { useLocation } from "wouter"; // or 'react-router-dom' if you use that
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // MOCK AUTHENTICATION DELAY
    setTimeout(() => {
      // Simple hardcoded check (Optional)
      if (username && password) {
        toast({
          title: "Secure Connection Established",
          description: "Welcome back, Facility Manager.",
          className: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800"
        });
        setLocation("/dashboard"); // Redirect to App
      } else {
        setIsLoading(false);
        toast({
            title: "Access Denied",
            description: "Please enter any username/password to demo.",
            variant: "destructive"
        });
      }
    }, 1500); // 1.5s fake loading time
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <Card className="w-full max-w-md z-10 border-slate-200 dark:border-slate-800 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mb-2">
            <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading">SustainOS</CardTitle>
          <CardDescription>
            Enterprise Energy Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Facility ID / Email</Label>
              <Input 
                id="email" 
                placeholder="admin@dtu.ac.in" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Secure Key</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-slate-50 dark:bg-slate-900/50"
                />
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating via SSO...
                </>
              ) : (
                <>
                  Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground mt-4">
              <span className="opacity-70">Protected by </span>
              <span className="font-semibold text-emerald-600">ISEA SecureAuth Protocol</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}