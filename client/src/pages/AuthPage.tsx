import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import AuthForm from "@/components/AuthForm";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { login, signup, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate("/");
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
        description: "Welcome to ModestGlow!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-end p-4">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">ModestGlow</h1>
            <p className="text-muted-foreground">Your Fashion Marketplace</p>
          </div>
          
          <AuthForm
            onLogin={handleLogin}
            onSignup={handleSignup}
          />
        </div>
      </div>
    </div>
  );
}
