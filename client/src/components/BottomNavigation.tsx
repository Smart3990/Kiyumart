import { Home, ShoppingCart, Package, User } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  badge?: number;
}

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const { data: cart = [] } = useQuery<Array<{ quantity: number }>>({
    queryKey: ["/api/cart"],
  });

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/" },
    { icon: ShoppingCart, label: "Cart", path: "/cart", badge: cartCount },
    { icon: Package, label: "Orders", path: "/orders" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav md:hidden safe-bottom">
      <div className="flex items-center justify-around h-20 px-3 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-smooth micro-scale relative group",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {/* Active Glow Effect */}
              {isActive && (
                <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl transition-smooth"
                  style={{ background: 'var(--gradient-primary)' }}
                />
              )}
              
              <div className={cn(
                "relative p-2 rounded-2xl transition-smooth",
                isActive && "glass-button"
              )}>
                <Icon className={cn(
                  "h-6 w-6 transition-smooth",
                  isActive && "scale-110 drop-shadow-lg"
                )} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center glass-badge bg-primary text-primary-foreground font-bold border-2 border-background">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-semibold tracking-wide transition-smooth",
                isActive ? "opacity-100 scale-105" : "opacity-60"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
