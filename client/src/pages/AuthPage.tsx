import AuthForm from "@/components/AuthForm";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-end p-4">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">KiyuMart</h1>
            <p className="text-muted-foreground">Your Fashion Marketplace</p>
          </div>
          
          <AuthForm
            onLogin={(email, password) => console.log('Login:', email, password)}
            onSignup={(name, email, password) => console.log('Signup:', name, email, password)}
          />
        </div>
      </div>
    </div>
  );
}
