import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AuthForm from "@/components/AuthForm";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles } from "lucide-react";
import logoLight from "@assets/light_mode_1762169855262.png";
import logoDark from "@assets/photo_2025-09-24_21-19-48-removebg-preview_1762169855290.png";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { login, signup, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seed/test-users", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Accounts Created!",
        description: "You can now log in with test credentials",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Seed Failed",
        description: error.message || "Failed to create test accounts",
        variant: "destructive",
      });
    },
  });

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      await signup({ name, email, password, role: "buyer" });
      toast({
        title: "Account Created",
        description: "Welcome to KiyuMart!",
      });
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  };

  const handleQuickLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: "Please create test accounts first",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div 
              className="cursor-pointer" 
              data-testid="logo-container"
              onClick={() => navigate("/")}
            >
              <img 
                src={logoLight}
                alt="KiyuMart"
                className="h-10 w-auto dark:hidden"
                data-testid="logo-light"
              />
              <img 
                src={logoDark}
                alt="KiyuMart"
                className="h-10 w-auto hidden dark:block"
                data-testid="logo-dark"
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Welcome to KiyuMart</h1>
            <p className="text-muted-foreground">Your Fashion Marketplace</p>
          </div>
          
          <AuthForm
            onLogin={handleLogin}
            onSignup={handleSignup}
          />

          <Card className="mt-6 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Quick Test Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For testing and development, create test accounts with one click.
              </p>
              
              <Button 
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="w-full"
                variant="outline"
                data-testid="button-seed-accounts"
              >
                {seedMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Accounts...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Test Accounts
                  </>
                )}
              </Button>

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleQuickLogin("admin@kiyumart.com", "admin123")}
                  data-testid="button-login-admin"
                >
                  Admin
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleQuickLogin("seller@kiyumart.com", "seller123")}
                  data-testid="button-login-seller"
                >
                  Seller
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleQuickLogin("buyer@kiyumart.com", "buyer123")}
                  data-testid="button-login-buyer"
                >
                  Buyer
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleQuickLogin("rider@kiyumart.com", "rider123")}
                  data-testid="button-login-rider"
                >
                  Rider
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Click "Create Test Accounts" first, then use the quick login buttons
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
